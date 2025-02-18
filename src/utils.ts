import { useEffect, useState } from 'react';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { Pharmacy } from './index.ts';

dotenv.config(); // Charger les variables d'environnement depuis .env

// Création de la connexion à la base de données PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});


// Fonction pour calculer la distance entre deux points géographiques
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fonction pour récupérer les pharmacies à proximité via l'API Overpass (OpenStreetMap)
export const fetchNearbyPharmacies = async (userLocation: [number, number]): Promise<Pharmacy[]> => {
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(`
      [out:json][timeout:25];
      node["amenity"="pharmacy"](around:2000,${userLocation[0]},${userLocation[1]});
      out body;
      >;
      out skel qt;
    `)}`
  });

  if (!response.ok) {
    throw new Error('Erreur réseau lors de la récupération des pharmacies.');
  }

  const data = await response.json();
  
  const pharmacies = data.elements.map((element: any) => {
    if (!element.lat || !element.lon) return null;

    return {
      id: element.id,
      name: element.tags?.name || 'Pharmacie sans nom',
      address: element.tags?.['addr:street']
        ? `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}`.trim()
        : 'Adresse non disponible',
      phone: element.tags?.phone,
      website: element.tags?.website,
      opening_hours: element.tags?.opening_hours,
      location: [element.lat, element.lon],
      distance: calculateDistance(userLocation[0], userLocation[1], element.lat, element.lon)
    };
  }).filter((p: Pharmacy | null): p is Pharmacy => p !== null)
    .filter((p: Pharmacy) => (p.distance || 0) <= 2)  // Filtrer les pharmacies dans un rayon de 2 km
    .sort((a: Pharmacy, b: Pharmacy) => (a.distance || 0) - (b.distance || 0));

  return pharmacies;
};

// Fonction pour récupérer les pharmacies de garde depuis le backend
export const fetchGuardPharmacies = async (): Promise<Pharmacy[]> => {
  const response = await fetch('/api/pharmacies-de-garde');
  if (!response.ok) {
    throw new Error('Erreur réseau lors de la récupération des pharmacies de garde.');
  }
  return await response.json();
};

// Hook pour récupérer les pharmacies à partir de la géolocalisation
export const usePharmacies = (userLocation: [number, number] | null) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userLocation) return;

    const getPharmacies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [nearbyPharmacies, guardPharmacies] = await Promise.all([
          fetchNearbyPharmacies(userLocation),
          fetchGuardPharmacies(),
        ]);
        
        // Combine les pharmacies de garde et celles à proximité
        const combinedPharmacies = [...nearbyPharmacies, ...guardPharmacies];
        setPharmacies(combinedPharmacies);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    };

    getPharmacies();
  }, [userLocation]);

  return { pharmacies, loading, error };
};

