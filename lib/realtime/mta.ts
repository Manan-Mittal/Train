import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { TransitAlert } from '@/lib/types/transit';

const MTA_ALERT_FEED = process.env.MTA_ALERT_FEED_URL ?? 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fall-alerts';

export async function fetchMtaAlerts(): Promise<TransitAlert[]> {
  try {
    const res = await fetch(MTA_ALERT_FEED, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const bytes = Buffer.from(await res.arrayBuffer());
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bytes);
    return feed.entity
      .filter((entity) => !!entity.alert)
      .map((entity) => ({
        agency: 'MTA',
        summary: entity.alert?.headerText?.translation?.[0]?.text ?? 'MTA service advisory',
        severity: 'warning' as const
      }));
  } catch {
    return [];
  }
}
