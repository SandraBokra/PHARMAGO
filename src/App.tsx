import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import Emergency from './pages/Emergency';
import Medecine from './pages/Medecine';

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="bg-gray-50 min-h-screen">
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/medecine" element={<Medecine />} />
              </Routes>
            </Layout>
          </Suspense>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
