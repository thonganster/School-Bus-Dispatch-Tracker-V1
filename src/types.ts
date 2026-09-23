export type BusState = 'not_arrived' | 'arrived' | 'departed';

export interface BusItem {
  id: number;
  busNumber: number;
  state: BusState;
  arrivedAt?: string;
  departedAt?: string;
  label?: string;
}

export interface BoardStats {
  total: number;
  notArrived: number;
  arrived: number;
  departed: number;
}
