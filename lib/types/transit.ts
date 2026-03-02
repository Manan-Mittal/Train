export type TransitMode = 'WALK' | 'LIGHT_RAIL' | 'SUBWAY' | 'RAIL' | 'BUS';

export interface TransitAlert {
  agency: string;
  summary: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Leg {
  mode: TransitMode;
  agency: string;
  from: string;
  to: string;
  scheduledDepart: string;
  scheduledArrive: string;
  realtimeDepart?: string;
  realtimeArrive?: string;
  headsign?: string;
  platform?: string;
  reliabilityScore: number;
  alerts: TransitAlert[];
}

export interface Itinerary {
  legs: Leg[];
  departTime: string;
  arriveTime: string;
  totalDuration: number;
  transfersCount: number;
  riskScore: number;
  source: string;
}

export interface ComputeRequest {
  origin: string;
  destination: string;
  arrivalTime: string;
  date: string;
  transferBufferMinutes: number;
  uncertaintyBufferMinutes: number;
  maxWalkingDistanceMeters: number;
  avoidModes: TransitMode[];
}

export interface ComputeResponse {
  recommended: Itinerary;
  backup: Itinerary | null;
  leaveBy: string;
  alerts: TransitAlert[];
  explanation: string;
  lateWarning?: string;
}
