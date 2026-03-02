import { describe, expect, it } from 'vitest';
import { buildTransitlandPlanUrl } from '@/lib/planners/transitland';

describe('buildTransitlandPlanUrl', () => {
  it('injects apikey query parameter when provided', () => {
    const url = buildTransitlandPlanUrl(
      {
        origin: 'Jersey City, NJ',
        destination: 'College Ave Student Center, New Brunswick, NJ',
        arrivalTime: '09:00',
        date: '2026-03-02',
        transferBufferMinutes: 8,
        uncertaintyBufferMinutes: 10,
        maxWalkingDistanceMeters: 1200,
        avoidModes: []
      },
      'abc123'
    );

    const parsed = new URL(url);
    expect(parsed.searchParams.get('apikey')).toBe('abc123');
    expect(parsed.searchParams.get('fromPlace')).toBe('Jersey City, NJ');
    expect(parsed.searchParams.get('toPlace')).toBe('College Ave Student Center, New Brunswick, NJ');
  });
});
