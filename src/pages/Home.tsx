import React, { useState, useEffect } from 'react';
import { Map } from '../composants/Map';
import { List, Search, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from '../composants/LoadingScreen';

const Home = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPharmacy = location.state?.selectedPharmacy;

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userLocation) {
      // Transition immédiate
      navigate('/pharmacies', { 
        state: { userLocation },
        replace: false
      });
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLoading(false);
        // Suppression de la redirection automatique
      },
      (error) => {
        setIsLoading(false);
        // Gérer l'erreur...
      }
    );
  }, []);

  const isHomePage = !selectedPharmacy && !location.state?.fromList;

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="h-screen relative bg-gray-50">
      {userLocation && (
        <>
          <Map 
            userLocation={userLocation} 
            selectedPharmacy={selectedPharmacy}
            isHomePage={isHomePage} // Ajout de la prop
          />
          
          {/* Bouton retour - toujours visible avec une pharmacie sélectionnée */}
          {selectedPharmacy && (
            <button
              onClick={() => navigate('/')}
              className="fixed top-3 md:top-4 left-3 md:left-4 z-10 
                       bg-white p-2 md:p-3 rounded-full shadow-lg 
                       hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </button>
          )}

          {/* Icône liste - visible tout le temps sauf sur la page d'accueil */}
          {!isHomePage && (
            <button
              onClick={handleSearchClick}
              className="fixed top-3 md:top-4 right-3 md:right-4 z-10 
                       bg-white p-2 md:p-3 rounded-full shadow-lg 
                       hover:bg-gray-50 active:scale-95 transition-all"
            >
              <List className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </button>
          )}

          {/* Bouton recherche - visible uniquement sur la page d'accueil */}
          {isHomePage && (
            <button
              onClick={handleSearchClick}
              className="fixed bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 
                       bg-emerald-600 text-white px-4 md:px-8 py-3 md:py-4 rounded-full 
                       shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Search className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-sm md:text-base font-medium">
                  Rechercher les pharmacies
                </span>
              </div>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
