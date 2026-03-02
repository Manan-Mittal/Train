import { fetchPathRealtimeAlerts } from './path';
import { fetchMtaAlerts } from './mta';
import { fetchNjTransitAlerts } from './njtransit';
import { TransitAlert } from '@/lib/types/transit';

export async function collectRealtimeAlerts(): Promise<TransitAlert[]> {
  const [path, mta, njt] = await Promise.all([fetchPathRealtimeAlerts(), fetchMtaAlerts(), fetchNjTransitAlerts()]);
  return [...path, ...mta, ...njt];
}
