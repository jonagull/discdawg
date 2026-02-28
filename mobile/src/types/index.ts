export interface FlightSample {
  t: number;
  r: number;
  p: number;
  y: number;
}

export interface Flight {
  id: string;
  discName: string;
  recordedAt: string;
  duration: number;
  samples: FlightSample[];
  synced: boolean;
}

export type DataMode = 'mock' | 'live';
