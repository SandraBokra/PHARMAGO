interface LocationCheckResult {
  supported: boolean;
  enabled: boolean;
  error?: string;
}

export class LocationService {
  static async checkAvailability(): Promise<LocationCheckResult> {
    // Vérifier si la géolocalisation est supportée
    if (!navigator.geolocation) {
      return {
        supported: false,
        enabled: false,
        error: "Votre appareil ne supporte pas la géolocalisation"
      };
    }

    // Vérifier si le GPS est activé (Android)
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'denied') {
          return {
            supported: true,
            enabled: false,
            error: "L'accès à la géolocalisation est bloqué"
          };
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des permissions:', error);
      }
    }

    // Test de la précision de la position
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      // Vérifier la précision
      if (position.coords.accuracy > 100) {
        return {
          supported: true,
          enabled: true,
          error: "La précision GPS est faible. Activez la haute précision."
        };
      }

      return {
        supported: true,
        enabled: true
      };
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            return {
              supported: true,
              enabled: false,
              error: "Veuillez autoriser l'accès à votre position"
            };
          case error.POSITION_UNAVAILABLE:
            return {
              supported: true,
              enabled: false,
              error: "Position indisponible. Vérifiez vos paramètres GPS"
            };
          case error.TIMEOUT:
            return {
              supported: true,
              enabled: false,
              error: "Délai d'attente dépassé. Vérifiez votre connexion"
            };
        }
      }

      return {
        supported: true,
        enabled: false,
        error: "Erreur lors de l'accès à votre position"
      };
    }
  }

  static openLocationSettings() {
    if ('AndroidOpenSettings' in window) {
      // @ts-ignore
      window.AndroidOpenSettings.openLocationSourceSettings();
    } else {
      window.open('app-settings:', '_system');
    }
  }
}
