import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MapController from './composants/MapController';
import LoadingScreen from './composants/LoadingScreen';
import PharmacyList from './composants/PharmacyList';
import { X, MapPin, Info, Loader2, Pill  } from 'lucide-react';
import { calculateDistance } from './utils/distanceUtils';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import PharmaciesList from './pages/PharmaciesList';
import PharmacyDetails from './pages/PharmacyDetails';
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pharmacies" element={<PharmaciesList />} />
          <Route path="/pharmacy/:id" element={<PharmacyDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
