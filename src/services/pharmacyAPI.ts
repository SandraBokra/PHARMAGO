import { Pharmacy } from '../types/Pharmacy';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export const fetchNearbyPharmacies = async (
  latitude: number,
  longitude: number
): Promise<Pharmacy[]> => {
  try {
    console.log('Fetching pharmacies for:', { latitude, longitude });

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
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    if (!data.elements || !Array.isArray(data.elements)) {
      console.log('No pharmacies found');
      return [];
    }

    const pharmacies = data.elements
      .filter(node => node && node.lat && node.lon)
      .map(node => {
        // Log each node for debugging
        console.log('Processing node:', node);
        
        return {
          id: `osm-${node.id}`,
          nom: node.tags?.name || "Pharmacie",
          adresse: node.tags?.["addr:street"] || 
                  node.tags?.["addr:full"] || 
                  "Adresse non disponible",
          latitude: node.lat,
          longitude: node.lon,
          telephone: node.tags?.["phone"] || 
                    node.tags?.["contact:phone"] || 
                    "Non disponible",
          en_garde: false
        };
      });

    console.log('Processed pharmacies:', pharmacies);
    return pharmacies;

  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return [];
  }
};
