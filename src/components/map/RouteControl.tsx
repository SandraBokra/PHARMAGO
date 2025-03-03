import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useTheme } from '../../context/ThemeContext';

interface RouteControlProps {
  start: [number, number];
  end: [number, number]; // La destination (pharmacie sélectionnée)
  onRouteFound: (summary: { distance: number; duration: number }) => void;
}

const RouteControl = ({ start, end }: RouteControlProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    try {
      // Router OSRM pour de meilleurs itinéraires piétons
      const router = L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot'
      });

      const control = L.Routing.control({
        router,
        waypoints: [
          L.latLng(start[0], start[1]),
          L.latLng(end[0], end[1])
        ],
        lineOptions: {
          styles: [{ color: '#10B981', weight: 4, opacity: 0.7 }]
        },
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: () => null
      }).addTo(map);

      return () => map.removeControl(control);
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
    }
  }, [map, start, end]);

  return null;
};

export default RouteControl;
