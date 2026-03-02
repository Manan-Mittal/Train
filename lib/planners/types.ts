import { ComputeRequest, Itinerary } from '@/lib/types/transit';

export interface PlannerProvider {
  name: string;
  planTrip(input: ComputeRequest): Promise<Itinerary[]>;
}
