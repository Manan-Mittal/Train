import { ComputeRequest, Itinerary, Leg } from '@/lib/types/transit';
import { PlannerProvider } from './types';
import { cached, withRetry } from '@/lib/utils';

const TRANSITLAND_BASE = process.env.TRANSITLAND_BASE_URL ?? 'https://transit.land';

export class TransitlandPlanner implements PlannerProvider {
  name = 'transitland';

  async planTrip(input: ComputeRequest): Promise<Itinerary[]> {
    const apiKey = process.env.TRANSITLAND_API_KEY;
    const url = `${TRANSITLAND_BASE}/api/v2/routing/otp/plan?fromPlace=${encodeURIComponent(input.origin)}&toPlace=${encodeURIComponent(input.destination)}&arriveBy=true&time=${encodeURIComponent(input.arrivalTime)}&date=${encodeURIComponent(input.date)}&mode=TRANSIT,WALK&maxWalkDistance=${input.maxWalkingDistanceMeters}`;

    return cached(url, async () =>
      withRetry(async () => {
        const res = await fetch(url, {
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
          next: { revalidate: 30 }
        });
        if (!res.ok) throw new Error(`Transitland request failed (${res.status})`);
        const body = await res.json();
        const itineraries = body?.plan?.itineraries ?? [];
        return itineraries.map((it: any) => normalizeItinerary(it, this.name));
      })
    );
  }
}

function normalizeItinerary(it: any, source: string): Itinerary {
  const legs: Leg[] = (it.legs ?? []).map((leg: any) => ({
    mode: normalizeMode(leg.mode),
    agency: leg.agencyName ?? 'Unknown',
    from: leg.from?.name ?? 'Unknown',
    to: leg.to?.name ?? 'Unknown',
    scheduledDepart: new Date(leg.startTime).toISOString(),
    scheduledArrive: new Date(leg.endTime).toISOString(),
    realtimeDepart: leg.realTime ? new Date(leg.startTime).toISOString() : undefined,
    realtimeArrive: leg.realTime ? new Date(leg.endTime).toISOString() : undefined,
    headsign: leg.headsign,
    platform: leg.from?.platformCode,
    reliabilityScore: leg.realTime ? 0.85 : 0.6,
    alerts: []
  }));

  return {
    legs,
    departTime: new Date(it.startTime).toISOString(),
    arriveTime: new Date(it.endTime).toISOString(),
    totalDuration: Math.round((it.duration ?? 0) / 60),
    transfersCount: it.transfers ?? Math.max(0, legs.length - 1),
    riskScore: 0,
    source
  };
}

function normalizeMode(mode: string): Leg['mode'] {
  if (mode === 'RAIL') return 'RAIL';
  if (mode === 'SUBWAY') return 'SUBWAY';
  if (mode === 'BUS') return 'BUS';
  if (mode === 'TRAM' || mode === 'LIGHTRAIL') return 'LIGHT_RAIL';
  return 'WALK';
}
