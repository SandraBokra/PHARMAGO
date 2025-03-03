import { useQuery } from '@tanstack/react-query';
import { fetchNearbyPharmacies } from '../services/pharmacyAPI';

// Pharmacies de garde en dur pour éviter les problèmes de module
const guardPharmacies = [
  {
    id: 'guard-1',
    nom: 'Pharmacie de Garde Centre',
    adresse: '123 Avenue Centrale',
    latitude: 5.3492,
    longitude: -4.0112,
    telephone: '07 07 07 07 07',
    en_garde: true
  },
  {
    id: 'guard-2',
    nom: 'Pharmacie de Garde Sud',
    adresse: '45 Boulevard Maritime',
    latitude: 5.3399,
    longitude: -4.0167,
    telephone: '07 08 08 08 08',
    en_garde: true
  }
];

export const usePharmacies = (location?: [number, number] | null) => {
  return useQuery({
    queryKey: ['pharmacies', location],
    queryFn: async () => {
      if (!location) return guardPharmacies;
      const realPharmacies = await fetchNearbyPharmacies(location[0], location[1]);
      return [...realPharmacies, ...guardPharmacies];
    },
    enabled: !!location
  });
};
