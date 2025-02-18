import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Search, Shield, Phone, Clock } from 'lucide-react';
import { calculateDistance } from '../utils/distanceUtils';
import type { Pharmacy } from '../types/Pharmacy';
import { api } from '../services/api';

const PharmaciesList = () => {
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  const [dutyPharmacies, setDutyPharmacies] = useState<Pharmacy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyDutyPharmacies, setShowOnlyDutyPharmacies] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userLocation = location.state?.userLocation;

  const fetchAllPharmacies = async () => {
    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(`
          [out:json][timeout:25];
          node["amenity"="pharmacy"](around:2000,${userLocation[0]},${userLocation[1]});
          out body;
          >;
          out skel qt;
        `)}`
      });
      
      const data = await response.json();
      const pharmacies = data.elements.map(element => ({
        id: element.id,
        name: element.tags?.name || 'Pharmacie sans nom',
        address: element.tags?.['addr:street'] || 'Adresse non disponible',
        location: [element.lat, element.lon],
        distance: calculateDistance(userLocation[0], userLocation[1], element.lat, element.lon),
        isOnDuty: false
      }));
      
      setAllPharmacies(pharmacies);
    } catch (error) {
      console.error('Erreur Overpass:', error);
    }
  };

  const fetchDutyPharmacies = async () => {
    try {
      const response = await api.getAllPharmacies();
      
      const nearbyDutyPharmacies = response.pharmacies
        .map(p => ({
          id: p.id,
          name: p.nom,
          address: p.adresse,
          location: [parseFloat(p.latitude), parseFloat(p.longitude)],
          distance: calculateDistance(
            userLocation[0], 
            userLocation[1], 
            parseFloat(p.latitude), 
            parseFloat(p.longitude)
          ),
          isOnDuty: true,
          phone: p.telephone,
          horaires: p.horaires
        }))
        .filter(p => p.distance <= 3);

      setDutyPharmacies(nearbyDutyPharmacies);
    } catch (error) {
      console.error('Erreur API:', error);
    }
  };

  useEffect(() => {
    if (userLocation) {
      setIsLoading(true);
      Promise.all([fetchAllPharmacies(), fetchDutyPharmacies()])
        .finally(() => setIsLoading(false));
    }
  }, [userLocation]);

  const mergedPharmacies = [...allPharmacies]
    .map(p => ({
      ...p,
      isOnDuty: dutyPharmacies.some(dp => 
        dp.location[0] === p.location[0] && dp.location[1] === p.location[1]
      )
    }))
    .concat(
      dutyPharmacies.filter(dp => 
        !allPharmacies.some(p => 
          p.location[0] === dp.location[0] && p.location[1] === dp.location[1]
        )
      )
    )
    .sort((a, b) => a.distance - b.distance);

  const filteredPharmacies = mergedPharmacies.filter(pharmacy => {
    if (showOnlyDutyPharmacies && !pharmacy.isOnDuty) return false;
    if (!searchQuery) return true;
    return pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handlePharmacySelect = (pharmacy: Pharmacy) => {
    navigate('/', { state: { selectedPharmacy: pharmacy } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec meilleure responsivité */}
      <header className="bg-emerald-600 p-2 sm:p-3 md:p-4 text-white sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-1.5 sm:p-2 hover:bg-emerald-700 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
          <h1 className="text-base sm:text-lg md:text-xl font-bold">Pharmacies à proximité</h1>
        </div>
        
        {/* Barre de recherche responsive */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une pharmacie..."
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 md:py-3 pl-8 sm:pl-10 rounded-lg 
                     bg-emerald-700/50 text-sm md:text-base
                     placeholder-emerald-100 border border-emerald-400/30
                     focus:outline-none focus:border-emerald-400"
          />
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-100 
                          absolute left-2 sm:left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Bouton de filtre responsive */}
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => setShowOnlyDutyPharmacies(!showOnlyDutyPharmacies)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm 
                     flex items-center gap-1 sm:gap-2 transition-colors
                     ${showOnlyDutyPharmacies 
                       ? 'bg-emerald-100 text-emerald-700' 
                       : 'bg-emerald-700/50 text-white'}`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Pharmacies de garde
          </button>
        </div>
      </header>

      {/* Liste des pharmacies responsive */}
      <div className="p-2 sm:p-3 md:p-4 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-8 space-y-4">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Recherche des pharmacies proches...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                fetchPharmacies().then(results => {
                  setPharmacies(results);
                  setIsLoading(false);
                });
              }}
              className="mt-2 text-sm bg-red-100 px-4 py-2 rounded-lg hover:bg-red-200"
            >
              Réessayer
            </button>
          </div>
        ) : filteredPharmacies.length === 0 && searchQuery ? (
          <div className="text-center text-gray-500 mt-4">
            Aucune pharmacie trouvée pour "{searchQuery}"
          </div>
        ) : (
          filteredPharmacies.map(pharmacy => (
            <div
              key={pharmacy.id}
              onClick={() => handlePharmacySelect(pharmacy)}
              className="relative bg-white mb-3 p-4 rounded-xl shadow-sm 
                     hover:shadow-lg transition-all duration-300 cursor-pointer
                     border border-gray-100 overflow-hidden group"
            >
              {/* Nouveau badge de garde plus épuré */}
              {pharmacy.isOnDuty && (
                <div className="absolute top-3 right-3 flex items-center gap-2 
                              bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full
                              shadow-sm border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium">De garde</span>
                </div>
              )}

              {/* Contenu principal avec padding ajusté */}
              <div className="space-y-2">
                <h2 className="font-semibold text-gray-800 text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                  {pharmacy.name}
                </h2>

                {/* Infos avec icônes */}
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm">{pharmacy.distance.toFixed(1)} km</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm line-clamp-1">{pharmacy.address}</span>
                  </div>

                  {pharmacy.phone && (
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm">{pharmacy.phone}</span>
                    </div>
                  )}
                </div>

                {/* Horaires pour les pharmacies de garde */}
                {pharmacy.isOnDuty && pharmacy.dutyHours && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 bg-emerald-50 
                                text-emerald-700 rounded-full text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        Ouvert {pharmacy.dutyHours.start} - {pharmacy.dutyHours.end}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Effet de bordure pour les pharmacies de garde */}
              {pharmacy.isOnDuty && (
                <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-xl" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PharmaciesList;
