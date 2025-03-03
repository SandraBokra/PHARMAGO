import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  return (
    <header className="bg-white/95 shadow fixed top-0 left-0 right-0 z-50 h-14">
      <div className="h-full px-4 flex items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/public/web-app-manifest-192x192.png" 
            alt="PharmaGo"
            className="h-8 w-8"
          />
          <div>
            <h1 className="text-lg font-bold text-emerald-600">
              PharmaGo
            </h1>
            <p className="text-[13px] text-gray-600">
              Trouvez une pharmacie près de vous
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
