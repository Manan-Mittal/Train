import { ComputeRequest, Itinerary } from '@/lib/types/transit';
import { PlannerProvider } from './types';
import { TransitlandPlanner } from './transitland';
import { GooglePlanner } from './google';

const providers: PlannerProvider[] = [new TransitlandPlanner(), new GooglePlanner()];

export interface PlanningDiagnostics {
  provider: string;
  status: 'ok' | 'error';
  itinerariesFound: number;
  message?: string;
}

export interface PlanningResult {
  itineraries: Itinerary[];
  diagnostics: PlanningDiagnostics[];
}

export async function planWithFallback(input: ComputeRequest): Promise<PlanningResult> {
  const collected: Itinerary[] = [];
  const diagnostics: PlanningDiagnostics[] = [];

  for (const provider of providers) {
    try {
      const itineraries = await provider.planTrip(input);
      diagnostics.push({ provider: provider.name, status: 'ok', itinerariesFound: itineraries.length });
      collected.push(...itineraries);
      if (itineraries.length) break;
    } catch (error: any) {
      diagnostics.push({
        provider: provider.name,
        status: 'error',
        itinerariesFound: 0,
        message: error?.message ?? 'Unknown planner error'
      });
    }
  }

  return { itineraries: collected, diagnostics };
}
