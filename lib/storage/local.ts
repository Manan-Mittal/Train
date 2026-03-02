'use client';

export interface Preset {
  id: string;
  label: string;
  origin: string;
  destination: string;
  arrivalTime: string;
}

const HOME_KEY = 'leavetime.home';
const PRESETS_KEY = 'leavetime.presets';

export function getHomeAddress(): string {
  return localStorage.getItem(HOME_KEY) ?? 'Jersey City, NJ';
}

export function saveHomeAddress(address: string) {
  localStorage.setItem(HOME_KEY, address);
}

export function getPresets(): Preset[] {
  const raw = localStorage.getItem(PRESETS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Preset[];
  } catch {
    return [];
  }
}

export function savePresets(presets: Preset[]) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}
