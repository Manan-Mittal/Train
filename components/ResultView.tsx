'use client';

import { useEffect, useState } from 'react';
import { ComputeResponse } from '@/lib/types/transit';

type StoredResult = ComputeResponse | { error: string; details?: unknown };

function isComputeResponse(value: StoredResult | null): value is ComputeResponse {
  return !!value && typeof value === 'object' && 'recommended' in value && !!value.recommended && Array.isArray(value.recommended.legs);
}

export default function ResultView() {
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('leavetime.result');
    if (!raw) return;

    try {
      setResult(JSON.parse(raw));
    } catch {
      setResult({ error: 'Failed to read trip result. Please recompute your trip.' });
    }
  }, []);

  if (!result) return <div className="card">No result found. Go back and compute a trip.</div>;

  if (!isComputeResponse(result)) {
    return (
      <div className="card">
        <h1>Could not compute route</h1>
        <p className="warning">{result.error ?? 'Unexpected response from compute service.'}</p>
        <p className="small">Please go back and try again with a different destination/time or adjust commute settings.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card">
        <h1>Leave by {new Date(result.leaveBy).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</h1>
        <p className="small">{result.explanation}</p>
        {result.lateWarning && <p className="warning">{result.lateWarning}</p>}
      </div>
      <div className="card">
        <h2>Recommended Itinerary</h2>
        {result.recommended.legs.map((leg, i) => (
          <details key={`${leg.from}-${leg.to}-${i}`} open={i === 0}>
            <summary>{new Date(leg.scheduledDepart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} {leg.mode} {leg.from} → {leg.to}</summary>
            <p>{leg.agency} {leg.headsign ? `• ${leg.headsign}` : ''} {leg.platform ? `• Platform ${leg.platform}` : ''}</p>
          </details>
        ))}
      </div>
      <div className="card">
        <h2>Service alerts</h2>
        {result.alerts.length ? result.alerts.map((a, idx) => <p key={idx}>{a.agency}: {a.summary}</p>) : <p>None currently surfaced.</p>}
      </div>
      {result.backup && (
        <div className="card">
          <h2>Backup plan</h2>
          <p>Departs {new Date(result.backup.departTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} • Risk {result.backup.riskScore}</p>
        </div>
      )}
    </div>
  );
}
