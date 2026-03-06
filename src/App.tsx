import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Absensi } from './pages/Absensi';
import { Notifikasi } from './pages/Notifikasi';
import { Managerial } from './pages/Managerial';
import { ManajemenKaryawan } from './pages/managerial/ManajemenKaryawan';
import { AnalisaKehadiran } from './pages/managerial/AnalisaKehadiran';
import { Pergerakan } from './pages/managerial/Pergerakan';
import { Toolbox } from './pages/Toolbox';
import { Notepad } from './pages/Notepad';
import { Tutup } from './pages/Tutup';
import { NotificationAlert } from './components/NotificationAlert';

// IMPORT Komponen Baru
import { BottomNav } from './components/BottomNav';

import { initializeFirebaseSync } from './store/useAppStore';

function App() {
  
  useEffect(() => {
    const cleanupSync = initializeFirebaseSync();
    return () => {
      cleanupSync();
    };
  }, []); 

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <NotificationAlert />
      
      {/* Wrapper untuk memberi ruang di bawah agar konten tidak tertutup bottom bar */}
      <div className="pb-24 min-h-screen">
        <Routes>
          <Route path="/" element={<Absensi />} />
          <Route path="/absensi" element={<Absensi />} />
          <Route path="/notifikasi" element={<Notifikasi />} />
          <Route path="/managerial" element={<Managerial />}>
            <Route index element={<Navigate to="karyawan" replace />} />
            <Route path="karyawan" element={<ManajemenKaryawan />} />
            <Route path="kehadiran" element={<AnalisaKehadiran />} />
            <Route path="pergerakan" element={<Pergerakan />} />
          </Route>

          <Route path="/toolbox" element={<Toolbox />} />
          <Route path="/notepad" element={<Notepad />} />
          <Route path="/tutup" element={<Tutup />} />
        </Routes>
      </div>

      {/* Panggil BottomNav di luar Routes agar persisten */}
      <BottomNav />
      
    </BrowserRouter>
  );
}

export default App;