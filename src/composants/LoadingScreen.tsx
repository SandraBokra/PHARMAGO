import { Pill } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-8 animate-fade-in max-w-md w-full">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl relative">
            <div className="animate-bounce">
              <Pill className="w-16 h-16 text-emerald-500 mx-auto" />
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent px-4">
              PharmaGo
            </h1>
            <div className="mt-6">
              <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500 animate-progress" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
