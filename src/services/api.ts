import { supabase } from './supabase.service';
import type { Pharmacy } from '../types/Pharmacy';
import { calculateDistance } from '../utils/distance';

// --- API principale Supabase ---

export const api = {
  async getAllPharmacies(userLocation: [number, number]): Promise<Pharmacy[]> {
    try {
      const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .order('nom');

      if (error) throw error;

      return (data || [])
        .filter(pharmacy =>
          calculateDistance(
            userLocation[0],
            userLocation[1],
            pharmacy.latitude,
            pharmacy.longitude
          ) <= 2
        );
    } catch (error) {
      console.warn('Erreur getAllPharmacies (Supabase):', error);
      return [];
    }
  },

  async getPharmaciesDeGarde(userLocation: [number, number]): Promise<Pharmacy[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .lte('date_debut_garde', today)
        .gt('date_fin_garde', today)
        .order('nom');

      if (error) throw error;

      return (data || []).filter(pharmacy =>
        calculateDistance(
          userLocation[0],
          userLocation[1],
          pharmacy.latitude,
          pharmacy.longitude
        ) <= 3
      );
    } catch (error) {
      console.warn('Erreur getPharmaciesDeGarde (Supabase):', error);
      return [];
    }
  },

  async getFavoritePharmacies(favoriteIds: string[]): Promise<Pharmacy[]> {
    if (!favoriteIds.length) return [];

    try {
      const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .in('id', favoriteIds)
        .order('nom');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Erreur getFavoritePharmacies (Supabase):', error);
      return [];
    }
  },

  async searchPharmacies(query: string): Promise<Pharmacy[]> {
    try {
      const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .or(`nom.ilike.%${query}%,adresse.ilike.%${query}%`)
        .order('nom');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Erreur searchPharmacies (Supabase):', error);
      return [];
    }
  },

  async getNearbyPharmacies(
    latitude: number,
    longitude: number,
    radius: number = 5
  ): Promise<Pharmacy[]> {
    try {
      const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .order('nom');

      if (error) throw error;

      return (data || [])
        .map(pharmacy => ({
          ...pharmacy,
          distance: calculateDistance(latitude, longitude, pharmacy.latitude, pharmacy.longitude),
        }))
        .filter(p => (p.distance ?? Infinity) <= radius)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    } catch (error) {
      console.warn('Erreur getNearbyPharmacies (Supabase):', error);
      return [];
    }
  },
};
