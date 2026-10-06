import { useQuery } from '@tanstack/react-query';
import { fetchNearbyPharmacies } from '../services/pharmacyAPI';
import { api } from '../services/api';
import { calculateDistance } from '../utils/distance';
import type { Pharmacy } from '../types/Pharmacy';

/**
 * Récupère les pharmacies à proximité de l'utilisateur.
 * Combine les données OpenStreetMap et Supabase (pharmacies de garde).
 */
export const usePharmacies = (location?: [number, number] | null) => {
  return useQuery<Pharmacy[]>({
    queryKey: ['pharmacies', location],
    queryFn: async () => {
      if (!location) return [];

      // Récupération en parallèle : OSM + pharmacies de garde Supabase
      const [osmPharmacies, gardePharmacies] = await Promise.all([
        fetchNearbyPharmacies(location[0], location[1]),
        api.getPharmaciesDeGarde(location).catch(() => [] as Pharmacy[]),
      ]);

      // Fusion + calcul des distances + tri par distance
      const all: Pharmacy[] = [...osmPharmacies, ...gardePharmacies];
      return all
        .map(p => ({
          ...p,
          distance: calculateDistance(location[0], location[1], p.latitude, p.longitude),
        }))
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    },
    enabled: !!location,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
