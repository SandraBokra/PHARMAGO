import { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Ajout de cet import
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePharmacies } from '../hooks/usePharmacies';
import BottomSheet from '../components/common/BottomSheet';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import RouteControl from '../components/map/RouteControl'; // Assurez-vous que le chemin est correct
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

const MapPage = () => {
  const routerLocation = useLocation(); // Renommé pour éviter la confusion
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(true); // Toujours visible par défaut
  const { location: userLocation, error, loading } = useGeolocation();
  const { data: pharmacies = [], isLoading: pharmaciesLoading } = usePharmacies(userLocation);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  if (error) {
    return <Alert type="error" title="Erreur de localisation" message={error} />;
  }

  if (loading || pharmaciesLoading || !userLocation) {
    return <LoadingSpinner fullScreen />;
  }

  console.log('Pharmacies chargées:', pharmacies); // Debug

  return (
    <div className="h-screen relative">
      <MapContainer
        center={userLocation}
        zoom={15}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Marqueur utilisateur */}
        <Marker
          position={userLocation}
          icon={L.divIcon({
            className: 'custom-marker',
            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })}
        >
          <Popup>Vous êtes ici</Popup>
        </Marker>

        {/* Marqueur pharmacie sélectionnée */}
        {selectedPharmacy && (
          <Marker
            position={[selectedPharmacy.latitude, selectedPharmacy.longitude]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>{selectedPharmacy.nom}</Popup>
          </Marker>
        )}

        {/* Itinéraire si une pharmacie est sélectionnée */}
        {selectedPharmacy && (
          <RouteControl
            start={userLocation}
            end={[selectedPharmacy.latitude, selectedPharmacy.longitude]}
          />
        )}
      </MapContainer>

      <BottomSheet
        pharmacies={pharmacies}
        userLocation={userLocation}
        selectedPharmacy={selectedPharmacy}
        onPharmacySelect={(pharmacy) => {
          setSelectedPharmacy(pharmacy);
        }}
      />
    </div>
  );
};

export default MapPage;
