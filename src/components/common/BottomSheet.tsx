import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Navigation2 } from 'lucide-react';
import { calculateDistance } from '../../utils/distance';  // Ajout de l'import
import type { Pharmacy } from '../../types/Pharmacy';
import { useNavigate } from 'react-router-dom';

interface Props {
  pharmacies: Pharmacy[];
  userLocation: [number, number];
  selectedPharmacy: Pharmacy | null;
  onPharmacySelect: (pharmacy: Pharmacy) => void;
}

const BottomSheet = ({ pharmacies, userLocation, selectedPharmacy, onPharmacySelect }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Filtrer les pharmacies : uniquement celles qui ne sont PAS de garde et à moins de 2km
  const nearbyRegularPharmacies = pharmacies
    .filter(pharmacy => !pharmacy.en_garde) // Exclure les pharmacies de garde
    .map(pharmacy => ({
      ...pharmacy,
      distance: calculateDistance(
        userLocation[0],
        userLocation[1],
        pharmacy.latitude,
        pharmacy.longitude
      )
    }))
    .filter(pharmacy => pharmacy.distance <= 2) // Pharmacies à 2km ou moins
    .sort((a, b) => a.distance - b.distance);

  const handlePharmacySelect = (pharmacy: Pharmacy) => {
    onPharmacySelect(pharmacy);
    setIsExpanded(false);
    navigate('/map', { replace: true });
  };

  return (
    <motion.div
      initial={{ y: '85%' }}
      animate={{ y: isExpanded ? '0%' : '85%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed bottom-[64px] left-0 right-0 bg-white rounded-t-xl shadow-lg z-40"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
    >
      <div className="p-4">
        {/* Poignée de glissement */}
        <div 
          className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        />
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Pharmacies à proximité ({nearbyRegularPharmacies.length})
          </h2>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronUp 
              className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>
        </div>

        {/* Liste des pharmacies */}
        <div className="overflow-y-auto max-h-[60vh]">
          {nearbyRegularPharmacies.length > 0 ? (
            nearbyRegularPharmacies.map(pharmacy => (
              <div
                key={pharmacy.id}
                onClick={() => handlePharmacySelect(pharmacy)}
                className={`
                  p-4 mb-2 rounded-lg border cursor-pointer
                  ${selectedPharmacy?.id === pharmacy.id 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-100 hover:border-emerald-200'
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{pharmacy.nom}</h3>
                    <p className="text-sm text-gray-600 mt-1">{pharmacy.adresse}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {pharmacy.distance.toFixed(1)} km
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`,
                      '_blank'
                    );
                  }}
                  className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 flex items-center"
                >
                  <Navigation2 size={14} className="mr-1" />
                  Itinéraire
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              Aucune pharmacie trouvée dans un rayon de 2km
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BottomSheet;
