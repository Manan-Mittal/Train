import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { planWithFallback } from '@/lib/planners';
import { collectRealtimeAlerts } from '@/lib/realtime';
import { applyBuffers } from '@/lib/scoring/buffer';
import { calculateRiskScore, sortItineraries } from '@/lib/scoring/risk';
import { ComputeResponse } from '@/lib/types/transit';

const schema = z.object({
  origin: z.string().min(3),
  destination: z.string().min(3),
  date: z.string(),
  arrivalTime: z.string(),
  transferBufferMinutes: z.number().min(0).max(45).default(8),
  uncertaintyBufferMinutes: z.number().min(0).max(60).default(10),
  maxWalkingDistanceMeters: z.number().default(1200),
  avoidModes: z.array(z.enum(['WALK', 'LIGHT_RAIL', 'SUBWAY', 'RAIL', 'BUS'])).default([])
});

export async function POST(req: NextRequest) {
  try {
    const input = schema.parse(await req.json());

    const planning = await planWithFallback(input);
    if (!planning.itineraries.length) {
      return NextResponse.json(
        {
          error: 'No route found from planners for this trip/time.',
          details: {
            diagnostics: planning.diagnostics,
            hint: 'Transitland routing is beta and coverage can vary by date/time. Try nearby station names, different arrival time, or enable Google fallback key.'
          }
        },
        { status: 404 }
      );
    }

    const alerts = await collectRealtimeAlerts();
    const enriched = planning.itineraries.map((itinerary) => ({
      ...itinerary,
      legs: itinerary.legs.map((leg) => ({
        ...leg,
        alerts: alerts.filter((a) => leg.agency.toLowerCase().includes(a.agency.toLowerCase()))
      }))
    }));

    const scored = enriched.map((it) => ({ ...it, riskScore: calculateRiskScore(it) }));
    const sorted = sortItineraries(scored);
    const recommended = sorted[0];
    const backup = sorted[1] ?? null;

    const isWeekend = [0, 6].includes(new Date(input.date).getDay());
    const buffered = applyBuffers(recommended, input.transferBufferMinutes, input.uncertaintyBufferMinutes, isWeekend);

    const lateEstimate = new Date(buffered.leaveBy).getTime() + 11 * 60000;
    const lateWarning =
      lateEstimate > new Date(recommended.departTime).getTime()
        ? `If you leave at ${new Date(lateEstimate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} you likely arrive late.`
        : undefined;

    const response: ComputeResponse = {
      recommended,
      backup,
      leaveBy: buffered.leaveBy,
      alerts,
      explanation: `Includes ${input.transferBufferMinutes}m transfer buffers + ${input.uncertaintyBufferMinutes}m uncertainty buffer and risk scoring.`,
      lateWarning
    };

    return NextResponse.json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message ?? 'Failed to compute route' }, { status: 500 });
  }
}
