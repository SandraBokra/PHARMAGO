import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Navigation2 } from 'lucide-react';
import { calculateDistance } from '../../utils/distance';
import type { Pharmacy } from '../../types/Pharmacy';

interface Props {
  pharmacies: Pharmacy[];
  userLocation: [number, number];
  onPharmacySelect: (pharmacy: Pharmacy) => void;
  selectedPharmacy: Pharmacy | null;
}

const MapBottomSheet = ({ 
  pharmacies, 
  userLocation, 
  onPharmacySelect,
  selectedPharmacy 
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrer et trier les pharmacies par distance
  const nearbyPharmacies = pharmacies
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

  return (
    <motion.div
      initial={{ y: '85%' }}
      animate={{ y: isExpanded ? '0%' : '85%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-40 max-h-[90vh]"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
    >
      <div className="p-4">
        {/* Poignée */}
        <div 
          className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        />
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Pharmacies à proximité ({nearbyPharmacies.length})
          </h2>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronUp className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Liste des pharmacies */}
        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
          {nearbyPharmacies.map(pharmacy => (
            <div
              key={pharmacy.id}
              className={`p-4 mb-2 rounded-lg border transition-all cursor-pointer
                ${selectedPharmacy?.id === pharmacy.id 
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-100 hover:border-emerald-200'}`}
              onClick={() => onPharmacySelect(pharmacy)}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{pharmacy.nom}</h3>
                  <p className="text-sm text-gray-600 mt-1">{pharmacy.adresse}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {pharmacy.distance != null ? `${pharmacy.distance.toFixed(1)} km` : '—'}
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
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MapBottomSheet;
