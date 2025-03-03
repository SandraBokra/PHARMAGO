import { useQuery } from '@tanstack/react-query';
import { fetchNearbyPharmacies } from '../services/pharmacyAPI';
import { calculateDistance } from '../utils/distance';

export const useNearbyPharmacies = (userLocation: [number, number] | null) => {
  return useQuery({
    queryKey: ['nearbyPharmacies', userLocation],
    queryFn: async () => {
      if (!userLocation) return [];
      
      const pharmacies = await fetchNearbyPharmacies(
        userLocation[0],
        userLocation[1]
      );

      // Ajouter la distance pour chaque pharmacie
      return pharmacies.map(pharmacy => ({
        ...pharmacy,
        distance: calculateDistance(
          userLocation[0],
          userLocation[1],
          pharmacy.latitude,
          pharmacy.longitude
        )
      }));
    },
    enabled: !!userLocation,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};
