import { describe, expect, it } from 'vitest';
import { applyBuffers } from '@/lib/scoring/buffer';
import { calculateRiskScore, sortItineraries } from '@/lib/scoring/risk';
import { Itinerary } from '@/lib/types/transit';

const baseItinerary: Itinerary = {
  legs: [
    {
      mode: 'LIGHT_RAIL',
      agency: 'HBLR',
      from: 'Home',
      to: 'Exchange Place',
      scheduledDepart: '2026-01-12T12:00:00.000Z',
      scheduledArrive: '2026-01-12T12:12:00.000Z',
      realtimeDepart: '2026-01-12T12:00:00.000Z',
      realtimeArrive: '2026-01-12T12:12:00.000Z',
      reliabilityScore: 0.8,
      alerts: []
    },
    {
      mode: 'RAIL',
      agency: 'NJT',
      from: 'Newark Penn',
      to: 'New Brunswick',
      scheduledDepart: '2026-01-12T12:16:00.000Z',
      scheduledArrive: '2026-01-12T12:50:00.000Z',
      reliabilityScore: 0.5,
      alerts: [{ agency: 'NJT', summary: 'Delay', severity: 'warning' }]
    }
  ],
  departTime: '2026-01-12T12:00:00.000Z',
  arriveTime: '2026-01-12T12:50:00.000Z',
  totalDuration: 50,
  transfersCount: 1,
  riskScore: 0,
  source: 'test'
};

describe('risk and buffer modeling', () => {
  it('calculates risk score from transfers, short transfer, missing realtime, and alerts', () => {
    expect(calculateRiskScore(baseItinerary)).toBe(7.25);
  });

  it('applies transfer + uncertainty buffers to leave-by time', () => {
    const output = applyBuffers(baseItinerary, 8, 10, false);
    expect(output.leaveBy).toBe('2026-01-12T11:42:00.000Z');
  });

  it('sorts itineraries by risk, then arrival, then duration', () => {
    const a = { ...baseItinerary, riskScore: 4, arriveTime: '2026-01-12T12:40:00.000Z', totalDuration: 45 };
    const b = { ...baseItinerary, riskScore: 3, arriveTime: '2026-01-12T12:48:00.000Z', totalDuration: 50 };
    const c = { ...baseItinerary, riskScore: 3, arriveTime: '2026-01-12T12:45:00.000Z', totalDuration: 60 };
    const sorted = sortItineraries([a, b, c]);
    expect(sorted[0]).toEqual(c);
    expect(sorted[1]).toEqual(b);
  });
});
