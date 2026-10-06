import { Link } from 'react-router-dom';
import { Navigation2, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePharmacies } from '../hooks/usePharmacies';
import L from 'leaflet';

const HomePage = () => {
  const { location } = useGeolocation();
  const { data: pharmacies } = usePharmacies(location);

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24">
      {/* En-tête */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Trouvez votre pharmacie</h2>
        <p className="text-gray-600 text-sm">
          Localisez rapidement les pharmacies ouvertes autour de vous
        </p>
      </div>

      {/* Cartes principales */}
      <div className="grid grid-cols-2 gap-4 px-4 mb-6">
        {/* Carte Liste */}
        <Link to="/map" state={{ showBottomSheet: true }}>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="aspect-[3/4.2] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-7 text-white flex flex-col justify-between shadow-lg"
          >
            <Navigation2 className="h-12 w-12" />
            <div>
              <h3 className="font-semibold text-xl">Liste pharmacies</h3>
              <p className="text-sm text-emerald-50">Voir la liste</p>
            </div>
          </motion.div>
        </Link>

        {/* Mini-carte */}
        <div className="aspect-[3.5/3] relative overflow-hidden rounded-[2rem] shadow-lg border-4 border-white">
          {location && (
            <MapContainer
              center={location}
              zoom={14}
              zoomControl={false}
              dragging={false}
              className="h-full w-full"
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Zone de 2km */}
              <Circle
                center={location}
                radius={2000}
                pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.1 }}
              />

              {/* Position utilisateur */}
              <Marker
                position={location}
                icon={L.divIcon({
                  html: `<div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
                  className: '',
                  iconSize: [12, 12],
                })}
              />

              {/* Marqueurs pharmacies */}
              {pharmacies?.map(pharmacy => (
                <Marker
                  key={pharmacy.id}
                  position={[pharmacy.latitude, pharmacy.longitude]}
                  icon={L.divIcon({
                    html: `<div class="w-2 h-2 bg-emerald-500 rounded-full"></div>`,
                    className: '',
                    iconSize: [8, 8],
                  })}
                />
              ))}
            </MapContainer>
          )}
          <Link
            to="/map"
            className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/50 to-transparent"
          >
            <span className="text-white font-medium text-sm">Voir carte complète</span>
          </Link>
        </div>
      </div>

      {/* Informations complémentaires */}
      <div className="px-4 space-y-4">
        {/* Pharmacies de garde */}
        <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-6 rounded-[2rem_0_2rem_0] text-white shadow-lg">
          <h3 className="text-lg font-medium mb-3">Pharmacies de garde</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-rose-100">Lundi - Samedi</p>
              <p className="font-medium">20h - 8h</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-rose-100">Dimanche</p>
              <p className="font-medium">24h/24</p>
            </div>
          </div>
        </div>

        {/* Besoin d'aide — lien téléphone (une seule fois) */}
        <a
          href="tel:+2250747387702"
          className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:border-emerald-200 transition-colors"
        >
          <div>
            <h3 className="font-medium text-gray-900">Besoin d'aide ?</h3>
            <p className="text-sm text-gray-500 mt-0.5">Notre équipe est disponible 24/7</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
            <Phone size={20} />
          </div>
        </a>
      </div>
    </div>
  );
};

export default HomePage;
