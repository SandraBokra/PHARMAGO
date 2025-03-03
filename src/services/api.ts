import { createClient } from '@supabase/supabase-js'
import type { Pharmacy } from '@/types/Pharmacy'

const supabaseUrl = "https://vpxuyzhshqpcyvhrzfsb.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHV5emhzaHFwY3l2aHJ6ZnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0ODQ3NzUsImV4cCI6MjA1NjA2MDc3NX0.e_efkq9gtjZ7PB8D1sfKAG6SEENHL865_gn1ydtu7hs"

const supabase = createClient(supabaseUrl, supabaseKey)

const handleError = (error: any) => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Une erreur est survenue');
};

export const api = {
  async getAllPharmacies(userLocation: [number, number]) {
    const { data, error } = await supabase
      .from('pharmacies_de_garde')
      .select('*')
      .order('nom');

    if (error) throw error;

    // Filtrer les pharmacies à 2km
    return {
      pharmacies: data?.filter(pharmacy => 
        calculateDistance(
          userLocation[0], 
          userLocation[1], 
          pharmacy.latitude, 
          pharmacy.longitude
        ) <= 2
      ) || []
    };
  },

  async getPharmaciesDeGarde(userLocation: [number, number]) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('pharmacies_de_garde')
      .select('*')
      .lte('date_debut_garde', today)
      .gt('date_fin_garde', today)
      .order('nom');

    if (error) throw error;

    // Filtrer les pharmacies de garde à 3km
    return {
      pharmacies: data?.filter(pharmacy => 
        calculateDistance(
          userLocation[0], 
          userLocation[1], 
          pharmacy.latitude, 
          pharmacy.longitude
        ) <= 3
      ) || []
    };
  },

  async getFavoritePharmacies(favoriteIds: string[]) {
    try {
      if (!favoriteIds.length) return { pharmacies: [] };

      const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .in('id', favoriteIds)
        .order('nom');

      if (error) throw error;
      return { pharmacies: data || [] };
    } catch (error) {
      return handleError(error);
    }
  },

  async searchPharmacies(query: string) {
    try {
      const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .or(`nom.ilike.%${query}%,adresse.ilike.%${query}%`)
        .order('nom');

      if (error) throw error;
      return { pharmacies: data || [] };
    } catch (error) {
      return handleError(error);
    }
  },

  async getNearbyPharmacies(latitude: number, longitude: number, radius: number = 5) {
    const { data, error } = await supabase
      .from('pharmacies_de_garde')
      .select('*')
      .order('nom');
    
    if (error) throw new Error(error.message);
    
    // Calculer la distance côté client
    const pharmaciesWithDistance = data?.map(pharmacy => {
      const distance = calculateDistance(
        latitude,
        longitude,
        pharmacy.latitude,
        pharmacy.longitude
      );
      return { ...pharmacy, distance };
    }).filter(p => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return { pharmacies: pharmaciesWithDistance || [] };
  }
};

// Fonction utilitaire pour calculer la distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
}

function toRad(value: number) {
  return value * Math.PI / 180;
}
