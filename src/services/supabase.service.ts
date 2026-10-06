import { createClient } from '@supabase/supabase-js';
import type { Pharmacy } from '../types/Pharmacy';

// ✅ Clés chargées depuis les variables d'environnement (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Fonctions de récupération des pharmacies ---

export const getPharmacies = async (): Promise<Pharmacy[]> => {
  try {
    const { data, error } = await supabase
      .from('pharmacies_de_garde_view')
      .select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return [];
  }
};

export const getPharmaciesDeGarde = async (): Promise<Pharmacy[]> => {
  const { data, error } = await supabase
    .from('pharmacies_de_garde')
    .select('*')
    .eq('en_garde', true);
  if (error) throw error;
  return data || [];
};

export const getPharmaciesByCommune = async (commune: string): Promise<Pharmacy[]> => {
  try {
    const { data, error } = await supabase
      .from('pharmacies_de_garde_view')
      .select('*')
      .ilike('adresse', `%${commune}%`);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return [];
  }
};

export const getAllPharmacies = async (): Promise<Pharmacy[]> => {
  try {
    const { data, error } = await supabase
      .from('pharmacies_de_garde_view')
      .select('*')
      .order('nom');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return [];
  }
};

export const getPharmaciesByStatus = async (isOnDuty: boolean): Promise<Pharmacy[]> => {
  try {
    const { data, error } = await supabase
      .from('pharmacies_de_garde_view')
      .select('*')
      .eq('en_garde', isOnDuty)
      .order('nom');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return [];
  }
};

export const searchPharmacies = async (query: string): Promise<Pharmacy[]> => {
  try {
    const { data, error } = await supabase
      .from('pharmacies_de_garde')
      .select('*')
      .or(`nom.ilike.%${query}%,adresse.ilike.%${query}%`)
      .order('nom');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return [];
  }
};
