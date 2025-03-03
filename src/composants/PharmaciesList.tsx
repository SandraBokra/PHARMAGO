import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock } from 'lucide-react';
import { api } from '../services/api';
import type { Pharmacy } from '../types/Pharmacy';

const PharmaciesList = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        const { pharmacies: data } = await api.getPharmaciesDeGarde();
        setPharmacies(data);
      } catch (error) {
        console.error("Erreur de chargement des pharmacies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  const handlePharmacyClick = (pharmacy: Pharmacy) => {
    navigate(`/pharmacy/${pharmacy.id}`, { state: pharmacy });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" />
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">Aucune pharmacie de garde trouvée</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 p-4">
      {pharmacies.map((pharmacy, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          key={pharmacy.id}
          onClick={() => handlePharmacyClick(pharmacy)}
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800">{pharmacy.nom}</h3>
          
          <div className="mt-2 space-y-2">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
              <span className="text-sm">{pharmacy.adresse}</span>
            </div>
            
            {pharmacy.telephone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-emerald-500" />
                <a 
                  href={`tel:${pharmacy.telephone}`} 
                  className="text-sm hover:text-emerald-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {pharmacy.telephone}
                </a>
              </div>
            )}

            {pharmacy.horaires && (
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                <span className="text-sm">{pharmacy.horaires}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-600">
              De garde jusqu'au {new Date(pharmacy.date_fin_garde).toLocaleDateString('fr-FR')}
            </span>
            <button 
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                // Ouvrir dans Google Maps
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${pharmacy.latitude},${pharmacy.longitude}`,
                  '_blank'
                );
              }}
            >
              Itinéraire →
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PharmaciesList;
