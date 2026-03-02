import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { TransitAlert } from '@/lib/types/transit';
import { cached, withRetry } from '@/lib/utils';

const PATH_URL = 'https://path.transitdata.nyc/gtfsrt';

export async function fetchPathRealtimeAlerts(): Promise<TransitAlert[]> {
  return cached('path-rt-alerts', async () =>
    withRetry(async () => {
      const res = await fetch(PATH_URL, { next: { revalidate: 20 } });
      if (!res.ok) throw new Error('PATH realtime unavailable');
      const bytes = Buffer.from(await res.arrayBuffer());
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bytes);

      const alerts: TransitAlert[] = [];
      for (const entity of feed.entity) {
        const alert = entity.alert;
        if (!alert) continue;
        alerts.push({
          agency: 'PATH',
          summary: alert.headerText?.translation?.[0]?.text ?? 'PATH service advisory',
          severity: 'warning'
        });
      }
      return alerts;
    })
  );
}
