import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// PAGINE
import Home from './pages/Home';
import Login from './pages/Login';

import TraslochiSalerno from './pages/TraslochiSalerno';
import TraslochiNapoli from './pages/TraslochiNapoli';
import TraslochiCampania from './pages/TraslochiCampania';
import TraslochiAvellino from './pages/TraslochiAvellino';
import TraslochiCaserta from './pages/TraslochiCaserta';
import TraslochiBenevento from './pages/TraslochiBenevento';

// ✅ Admin lazy: non entra nel bundle iniziale
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/traslochi-salerno" element={<TraslochiSalerno />} />
        <Route path="/traslochi-napoli" element={<TraslochiNapoli />} />
        <Route path="/traslochi-campania" element={<TraslochiCampania />} />
        <Route path="/traslochi-avellino" element={<TraslochiAvellino />} />
        <Route path="/traslochi-caserta" element={<TraslochiCaserta />} />
        <Route path="/traslochi-benevento" element={<TraslochiBenevento />} />

        <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />

        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <AdminPanel />
            </Suspense>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
