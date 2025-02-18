import { useState, useEffect } from 'react';
import { Pharmacy } from '../types';

export const usePharmacies = (userLocation: [number, number] | null) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('usePharmacies effect running with location:', userLocation);

    const fetchPharmacies = async () => {
      try {
        console.log('Fetching pharmacies from API...');
        const response = await fetch('http://localhost:5000/api/pharmacies_de_garde');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received pharmacies data:', data);
        
        setPharmacies(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch pharmacies:', err);
        setError('Erreur lors de la récupération des pharmacies');
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [userLocation]);

  return { pharmacies, loading, error };
};
