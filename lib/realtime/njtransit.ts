import { TransitAlert } from '@/lib/types/transit';

export async function fetchNjTransitAlerts(): Promise<TransitAlert[]> {
  const endpoint = process.env.NJT_ALERT_ENDPOINT;
  if (!endpoint) {
    return [{ agency: 'NJT', summary: 'Realtime unavailable; using scheduled service assumptions', severity: 'info' }];
  }
  try {
    const res = await fetch(endpoint, {
      headers: process.env.NJT_API_KEY ? { Authorization: `Bearer ${process.env.NJT_API_KEY}` } : undefined,
      next: { revalidate: 30 }
    });
    if (!res.ok) return [];
    const body = await res.json();
    return (body.alerts ?? []).map((a: any) => ({
      agency: 'NJT',
      summary: a.summary ?? 'NJT alert',
      severity: 'warning' as const
    }));
  } catch {
    return [];
  }
}
