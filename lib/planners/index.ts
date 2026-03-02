import { ComputeRequest, Itinerary } from '@/lib/types/transit';
import { PlannerProvider } from './types';
import { TransitlandPlanner } from './transitland';
import { GooglePlanner } from './google';

const providers: PlannerProvider[] = [new TransitlandPlanner(), new GooglePlanner()];

export async function planWithFallback(input: ComputeRequest): Promise<Itinerary[]> {
  const collected: Itinerary[] = [];
  for (const provider of providers) {
    try {
      const itineraries = await provider.planTrip(input);
      collected.push(...itineraries);
      if (collected.length) break;
    } catch {
      continue;
    }
  }
  return collected;
}
