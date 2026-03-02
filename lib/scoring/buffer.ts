import { Itinerary, Leg } from '@/lib/types/transit';

export function transferBufferForLeg(leg: Leg, isWeekend: boolean): number {
  let extra = 0;
  if (leg.mode === 'BUS') extra += 4;
  if (leg.agency.toLowerCase().includes('path') && (isWeekend || isLateNight(leg))) extra += 3;
  return extra;
}

function isLateNight(leg: Leg): boolean {
  const hour = new Date(leg.scheduledDepart).getHours();
  return hour >= 22 || hour < 5;
}

export function applyBuffers(
  itinerary: Itinerary,
  transferBufferMinutes: number,
  uncertaintyBufferMinutes: number,
  isWeekend: boolean
): { leaveBy: string; adjustedDepart: string } {
  let totalTransferBuffer = 0;
  for (let i = 0; i < itinerary.legs.length - 1; i++) {
    totalTransferBuffer += transferBufferMinutes + transferBufferForLeg(itinerary.legs[i + 1], isWeekend);
  }

  const departMs = new Date(itinerary.departTime).getTime();
  const adjustedDepart = new Date(departMs - totalTransferBuffer * 60000).toISOString();
  const leaveBy = new Date(new Date(adjustedDepart).getTime() - uncertaintyBufferMinutes * 60000).toISOString();
  return { leaveBy, adjustedDepart };
}
