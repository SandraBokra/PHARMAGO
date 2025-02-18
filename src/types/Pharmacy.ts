export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  opening_hours?: string;
  location: [number, number];
  distance?: number;
  isOnDuty: boolean;
  dutyHours?: {
    start: string;
    end: string;
  };
}
