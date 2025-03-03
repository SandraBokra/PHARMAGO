import L from 'leaflet';

export const createPharmacyIcon = (isOnDuty: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-1/2">
          <div class="w-4 h-4 rounded-full ${
            isOnDuty ? 'bg-emerald-500' : 'bg-gray-400'
          } border-2 border-white shadow-md"></div>
          ${isOnDuty ? `
            <div class="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
          ` : ''}
        </div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

export const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-1/2">
          <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
          <div class="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-50"></div>
        </div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};
