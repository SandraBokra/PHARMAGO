import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  userLocation: [number, number];
  selectedPharmacy: Pharmacy | null;
  pharmacies: Pharmacy[];
}

const MapController = ({ userLocation }: { userLocation: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    // Zoom plus proche pour mobile
    map.setView(userLocation, 16, {
      animate: true,
      duration: 1
    });

    // Ajout du bouton de recentrage
    const locationButton = L.control({ position: 'bottomright' });
    locationButton.onAdd = () => {
      const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
      button.innerHTML = `
        <div class="bg-white w-10 h-10 flex items-center justify-center rounded-lg shadow-lg">
          <svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
      `;
      button.onclick = () => {
        map.flyTo(userLocation, 16, {
          animate: true,
          duration: 1
        });
      };
      return button;
    };
    locationButton.addTo(map);

    return () => {
      locationButton.remove();
    };
  }, [map, userLocation]);

  return null;
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
        <div class="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-ping"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const createPharmacyIcon = (enGarde: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="w-3 h-3 rounded-full ${
        enGarde ? 'bg-emerald-500' : 'bg-gray-400'
      } border-2 border-white shadow-lg"></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const InteractiveMap = ({ userLocation, pharmacies = [], selectedPharmacy }: Props) => {
  return (
    <div className="absolute inset-0">
      <MapContainer
        center={userLocation}
        zoom={16}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Position utilisateur */}
        <Marker position={userLocation} icon={createUserIcon()} />

        {/* Pharmacies avec vérification */}
        {Array.isArray(pharmacies) && pharmacies.map(pharmacy => (
          <Marker
            key={pharmacy.id}
            position={[pharmacy.latitude, pharmacy.longitude]}
            icon={createPharmacyIcon(pharmacy.en_garde)}
          />
        ))}

        <MapController userLocation={userLocation} />
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
