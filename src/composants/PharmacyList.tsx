import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock } from 'lucide-react';
import type { Pharmacy } from '../types/Pharmacy';

interface PharmacyListProps {
  pharmacies: Pharmacy[];
}

const PharmacyList = ({ pharmacies }: PharmacyListProps) => {
  const navigate = useNavigate();

  const handlePharmacyClick = (pharmacy) => {
    navigate(`/pharmacy/${pharmacy.id}`, { state: pharmacy });
  };

  return (
    <div className="mt-6 space-y-4">
      {pharmacies.map((pharmacy, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          key={pharmacy.id}
          onClick={() => handlePharmacyClick(pharmacy)}
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800">{pharmacy.name}</h3>
          
          <div className="mt-2 space-y-2">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
              <span className="text-sm">{pharmacy.address}</span>
            </div>
            
            {pharmacy.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-emerald-500" />
                <a href={`tel:${pharmacy.phone}`} className="text-sm hover:text-emerald-600">
                  {pharmacy.phone}
                </a>
              </div>
            )}

            {pharmacy.opening_hours && (
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                <span className="text-sm">{pharmacy.opening_hours}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-600">
              {pharmacy.distance} km
            </span>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Itinéraire →
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PharmacyList;
