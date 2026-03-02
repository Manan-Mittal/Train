import { Itinerary } from '@/lib/types/transit';

export function calculateRiskScore(itinerary: Itinerary): number {
  const shortTransfers = countShortTransfers(itinerary);
  const noRealtimeLegs = itinerary.legs.filter((leg) => !leg.realtimeDepart || !leg.realtimeArrive).length;
  const disruptionCount = itinerary.legs.flatMap((leg) => leg.alerts).length;

  return Number(
    (
      itinerary.transfersCount * 1.0 +
      shortTransfers * 2.5 +
      noRealtimeLegs * 0.75 +
      disruptionCount * 3.0
    ).toFixed(2)
  );
}

export function countShortTransfers(itinerary: Itinerary): number {
  let short = 0;
  for (let i = 0; i < itinerary.legs.length - 1; i++) {
    const arrive = new Date(itinerary.legs[i].realtimeArrive ?? itinerary.legs[i].scheduledArrive).getTime();
    const depart = new Date(itinerary.legs[i + 1].realtimeDepart ?? itinerary.legs[i + 1].scheduledDepart).getTime();
    const diffMin = (depart - arrive) / 60000;
    if (diffMin < 6) short += 1;
  }
  return short;
}

export function sortItineraries(itineraries: Itinerary[]): Itinerary[] {
  return [...itineraries].sort((a, b) => {
    if (a.riskScore !== b.riskScore) return a.riskScore - b.riskScore;
    if (a.arriveTime !== b.arriveTime) return new Date(a.arriveTime).getTime() - new Date(b.arriveTime).getTime();
    return a.totalDuration - b.totalDuration;
  });
}
