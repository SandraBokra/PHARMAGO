export interface Pharmacy {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  telephone: string;
  horaires: string;
  date_de_garde: string;
  location: [number, number];
  distance?: number;
}
