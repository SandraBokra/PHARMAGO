export interface Pharmacy {
  id: string;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  telephone: string;
  en_garde: boolean;
  horaires?: {
    ouverture: string;
    fermeture: string;
  };
}
