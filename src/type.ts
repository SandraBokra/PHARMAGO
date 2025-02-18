// type.ts

export interface Pharmacy {
    id: number;
    name: string;
    address: string;
    phone?: string;
    opening_hours?: string;
    location: [number, number];  // [latitude, longitude]
    distance?: number;  // Distance en kilomètres
  }
  