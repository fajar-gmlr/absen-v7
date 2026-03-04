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

// IMPORT PENTING: Panggil inisialisasi Firebase dari store Anda
import { initializeFirebaseSync } from './store/useAppStore';

function App() {
  
  // EFEK PENTING: Hidupkan koneksi Firebase saat aplikasi pertama kali dibuka
  useEffect(() => {
    // Memulai sinkronisasi data dari Firebase (Karyawan, Absensi, Libur, dll)
    const cleanupSync = initializeFirebaseSync();
    
    // Membersihkan listener jika komponen App di-unmount (mencegah memory leak)
    return () => {
      cleanupSync();
    };
  }, []); // Array dependency kosong memastikan ini hanya berjalan satu kali

  return (
    // MENGHILANGKAN WARNING: Menambahkan properti future flag dari React Router v7
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <NotificationAlert />
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
    </BrowserRouter>
  );
}

export default App;