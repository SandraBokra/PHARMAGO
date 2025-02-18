import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, ArrowLeft, Navigation } from 'lucide-react';
import type { Pharmacy } from '../types/Pharmacy';

const PharmacyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pharmacy = location.state as Pharmacy;

  const handleGetDirections = () => {
    navigate('/', { state: { selectedPharmacy: pharmacy } });
  };

  if (!pharmacy) return <div>Pharmacie non trouvée</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-6">
        <button onClick={() => navigate(-1)} className="flex items-center mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
        <h1 className="text-2xl font-bold">{pharmacy.name}</h1>
        <p className="text-emerald-100">{pharmacy.distance?.toFixed(1)} km</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-emerald-600 mr-3" />
              <p>{pharmacy.address}</p>
            </div>
            
            {pharmacy.phone && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-emerald-600 mr-3" />
                <a href={`tel:${pharmacy.phone}`} className="text-emerald-600">
                  {pharmacy.phone}
                </a>
              </div>
            )}

            {pharmacy.opening_hours && (
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-emerald-600 mr-3" />
                <p>{pharmacy.opening_hours}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleGetDirections}
            className="mt-6 w-full bg-emerald-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Obtenir l'itinéraire
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetails;
