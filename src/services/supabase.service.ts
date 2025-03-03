import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://vpxuyzhshqpcyvhrzfsb.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHV5emhzaHFwY3l2aHJ6ZnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0ODQ3NzUsImV4cCI6MjA1NjA2MDc3NX0.e_efkq9gtjZ7PB8D1sfKAG6SEENHL865_gn1ydtu7hs"

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Pharmacy {
    id: string;
    nom: string;
    adresse: string;
    latitude: number | null;
    longitude: number | null;
    telephone: string;
    horaires: string;
    date_debut_garde: string;
    date_fin_garde: string;
    en_garde: boolean;
}

export const getPharmacies = async (): Promise<Pharmacy[]> => {
    try {
        const { data, error } = await supabase
            .from('pharmacies_de_garde_view')
            .select('*')
        
        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Erreur lors de la récupération des pharmacies:', error)
        return []
    }
}

export const getPharmaciesDeGarde = async () => {
    const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .eq('en_garde', true)

    if (error) throw error
    return data
}

export const getPharmaciesByCommune = async (commune: string): Promise<Pharmacy[]> => {
    try {
        const { data, error } = await supabase
            .from('pharmacies_de_garde_view')
            .select('*')
            .ilike('adresse', `%${commune}%`)
        
        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Erreur lors de la récupération des pharmacies:', error)
        return []
    }
}

export const getAllPharmacies = async (): Promise<Pharmacy[]> => {
    try {
        const { data, error } = await supabase
            .from('pharmacies_de_garde_view')
            .select('*')
            .order('nom')
        
        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Erreur lors de la récupération des pharmacies:', error)
        return []
    }
}

export const getPharmaciesByStatus = async (isOnDuty: boolean): Promise<Pharmacy[]> => {
    try {
        const { data, error } = await supabase
            .from('pharmacies_de_garde_view')
            .select('*')
            .eq('en_garde', isOnDuty)
            .order('nom')
        
        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Erreur lors de la récupération des pharmacies:', error)
        return []
    }
}

export const getNearbyPharmacies = async (lat: number, lon: number, radius: number) => {
    const { data, error } = await supabase
        .from('pharmacies_de_garde')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

    if (error) throw error
    
    // Filtrer les résultats par distance
    return data.filter(pharmacy => {
        if (!pharmacy.latitude || !pharmacy.longitude) return false
        const distance = calculateDistance(lat, lon, pharmacy.latitude, pharmacy.longitude)
        return distance <= radius
    })
}
