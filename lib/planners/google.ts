import { ComputeRequest, Itinerary } from '@/lib/types/transit';
import { PlannerProvider } from './types';

export class GooglePlanner implements PlannerProvider {
  name = 'google';

  async planTrip(input: ComputeRequest): Promise<Itinerary[]> {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return [];

    const params = new URLSearchParams({
      origin: input.origin,
      destination: input.destination,
      mode: 'transit',
      arrival_time: String(Math.floor(new Date(`${input.date}T${input.arrivalTime}`).getTime() / 1000)),
      key
    });

    const res = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);
    if (!res.ok) throw new Error(`Google planner failed (${res.status})`);
    const body = await res.json();

    return (body.routes ?? []).map((route: any) => ({
      legs: [],
      departTime: new Date().toISOString(),
      arriveTime: new Date().toISOString(),
      totalDuration: route.legs?.[0]?.duration?.value ? Math.round(route.legs[0].duration.value / 60) : 0,
      transfersCount: 0,
      riskScore: 0,
      source: this.name
    }));
  }
}
