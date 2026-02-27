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

function App() {
  return (
    <BrowserRouter>
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
