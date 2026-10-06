/**
 * Type principal Pharmacy — source de vérité unique pour toute l'application.
 * Correspond exactement à la table `pharmacies_de_garde` dans Supabase.
 */
export interface Pharmacy {
  id: string;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  telephone: string;
  horaires?: string;
  date_debut_garde?: string;
  date_fin_garde?: string;
  en_garde: boolean;
  distance?: number; // calculée côté client en km, non stockée en base
}
