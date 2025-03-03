import { useState, useEffect } from 'react';

export interface GeolocationState {
  location: [number, number] | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    accuracy: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: "La géolocalisation n'est pas supportée par votre navigateur",
        loading: false
      }));
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setState({
        location: [position.coords.latitude, position.coords.longitude],
        accuracy: position.coords.accuracy,
        error: null,
        loading: false
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let message = "Erreur de géolocalisation";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "Veuillez autoriser l'accès à votre position";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "Position non disponible";
          break;
        case error.TIMEOUT:
          message = "Délai d'attente dépassé";
          break;
      }
      setState(prev => ({
        ...prev,
        error: message,
        loading: false
      }));
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
};

export default useGeolocation;
