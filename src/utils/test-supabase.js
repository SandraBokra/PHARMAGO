import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Test de connexion Supabase...');
console.log('URL:', url ? url : '(non définie)');

if (!url || !key) {
  console.error('❌ Variables VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('pharmacies_de_garde')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
    } else {
      console.log('✅ Connexion Supabase réussie ! Enregistrement :', data);
    }
  } catch (err) {
    console.error('❌ Projet Supabase injoignable ou en pause :', err.message || err);
  }
}

testConnection();
