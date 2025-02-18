import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { MapPin, User } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

const MapController = ({ userLocation, selectedPharmacy, pharmacies }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  const createUserLocationIcon = () => {
    return L.divIcon({
      className: 'custom-icon user-location-icon',
      html: `
        <div class="user-location-dot">
          <div class="user-location-pulse"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createPharmacyIcon = (pharmacy) => {
    return L.divIcon({
      className: `custom-icon ${pharmacy.isOnDuty ? 'duty-icon' : ''}`,
      html: ReactDOMServer.renderToString(
        <div className={`pharmacy-marker ${pharmacy.isOnDuty ? 'on-duty' : ''}`}>
          <MapPin 
            size={24} 
            color={pharmacy.isOnDuty ? '#059669' : '#6B7280'} 
            strokeWidth={2.5}
          />
        </div>
      ),
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  };

  useEffect(() => {
    if (!userLocation) return;
    
    const userMarkerIcon = createUserLocationIcon();
    
    L.marker(userLocation, { icon: userMarkerIcon }).addTo(map)
      .bindPopup("Vous êtes ici");
    
    pharmacies?.forEach(pharmacy => {
      const pharmacyMarkerIcon = createPharmacyIcon(pharmacy);
      L.marker(pharmacy.location, { icon: pharmacyMarkerIcon })
        .addTo(map)
        .bindPopup(pharmacy.name);
    });
  }, [map, userLocation, pharmacies]);

  useEffect(() => {
    // Nettoyer l'ancien itinéraire
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    if (!selectedPharmacy) return;

    // Créer le nouvel itinéraire
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(selectedPharmacy.location[0], selectedPharmacy.location[1])
      ],
      language: 'fr',
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: { styles: [{ color: '#059669', weight: 4, opacity: 0.7 }] }
    }).addTo(map);

    // Ajuster le zoom pour voir tout l'itinéraire
    const bounds = L.latLngBounds([userLocation, selectedPharmacy.location]);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, userLocation, selectedPharmacy]);

  return null;
}

export default MapController;
