import type { Pharmacy } from '../types/Pharmacy';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

interface OsmElement {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export const fetchNearbyPharmacies = async (
  latitude: number,
  longitude: number
): Promise<Pharmacy[]> => {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:2000,${latitude},${longitude});
      );
      out body;
    `;

    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.elements || !Array.isArray(data.elements)) {
      return [];
    }

    const pharmacies: Pharmacy[] = (data.elements as OsmElement[])
      .filter((node): node is OsmElement => Boolean(node && node.lat && node.lon))
      .map((node): Pharmacy => ({
        id: `osm-${node.id}`,
        nom: node.tags?.name || 'Pharmacie',
        adresse:
          node.tags?.['addr:street'] ||
          node.tags?.['addr:full'] ||
          'Adresse non disponible',
        latitude: node.lat,
        longitude: node.lon,
        telephone:
          node.tags?.['phone'] || node.tags?.['contact:phone'] || 'Non disponible',
        en_garde: false,
      }));

    return pharmacies;
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies OpenStreetMap:', error);
    return [];
  }
};
