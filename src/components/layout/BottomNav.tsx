import { Home, Map, Star, PhoneCall } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navigationItems = [
  { name: 'Accueil', icon: Home, path: '/' },
  { name: 'Carte', icon: Map, path: '/map' },
  { name: 'Aide', icon: Star, path: '/medecine' },
  { name: 'Urgence', icon: PhoneCall, path: '/emergency', highlight: true },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999]">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col">
          {/* Navigation items */}
          <div className="flex justify-around items-center h-16">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative group"
                >
                  <motion.div
                    className={`flex flex-col items-center px-3 py-1
                      ${isActive ? 'text-emerald-600' : 'text-gray-600'}
                      ${item.highlight ? 'text-rose-600' : ''}
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon 
                      size={23} 
                      className={`${isActive ? 'animate-pulse' : ''}`}
                    />
                    <span className="text-xs mt-1 font-medium">{item.name}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="bottomNav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-600"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Signature professionnelle */}
          <div className="py-2 text-center border-t border-gray-100 ">
            <div className="inline-flex items-center space-x-1 text-xs text-emerald-600 transition-color">
              <span>Développé par</span>
              <span className="font-medium">Bokra Sandra</span>
              <span className="text-emerald-500">•</span>
              <span className="text-gray-400">2025</span>
            </div>
        
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
