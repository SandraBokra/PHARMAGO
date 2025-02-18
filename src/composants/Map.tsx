import { MapContainer, TileLayer } from 'react-leaflet';
import MapController from './MapController';
import { useQuery } from '@tanstack/react-query';
import 'leaflet/dist/leaflet.css';
import './Map.css';

interface MapProps {
  userLocation: [number, number];
  selectedPharmacy: any;
  isHomePage?: boolean; // Nouvelle prop
}

export const Map = ({ userLocation, selectedPharmacy, isHomePage }: MapProps) => {
  const { data: pharmacies } = useQuery({
    queryKey: ['pharmacies'],
    queryFn: async () => {
      const response = await api.getAllPharmacies();
      return response.pharmacies;
    }
  });

  return (
    <div className={`${isHomePage ? 'absolute inset-x-0 top-0 h-[75vh] rounded-b-3xl overflow-hidden' : 'absolute inset-0'}`}>
      <MapContainer
        center={userLocation}
        zoom={16}
        minZoom={12}
        maxZoom={19}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        <TileLayer 
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap France'
          maxZoom={19}
          opacity={0.7}
        />
        <MapController 
          userLocation={userLocation} 
          selectedPharmacy={selectedPharmacy}
          pharmacies={pharmacies || []}
        />
      </MapContainer>
    </div>
  );
};