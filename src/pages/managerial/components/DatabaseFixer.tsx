import { useState } from 'react';
import { database } from '../../../firebase/config';
import { ref, get, update } from 'firebase/database';

export function DatabaseFixer() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFixData = async () => {
    if (!window.confirm('Apakah Anda yakin? Klik OK HANYA JIKA Anda ingin merapikan data absensi lama.')) return;

    setLoading(true);
    setMessage('Menghubungkan ke Firebase dan memproses data...');
    
    try {
      const attendanceRef = ref(database, 'attendance');
      const snapshot = await get(attendanceRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const updates: Record<string, any> = {};
        let count = 0;

        Object.keys(data).forEach((key) => {
          const record = data[key];
          const oldTimestamp = record.timestamp; 
          
          let correctedTime: Date | null = null;
          let needsUpdate = false;

          // DETEKSI FORMAT 1: Murni UTC (Z)
          if (oldTimestamp.endsWith('Z')) {
            correctedTime = new Date(oldTimestamp); 
            needsUpdate = true;
          } 
          // DETEKSI FORMAT 2: Buggy Format (+07:00 lama)
          else if (oldTimestamp.includes('+07:00')) {
            // Mencegah data test hari ini (4 Maret ke atas) ikut terubah
            if (oldTimestamp < "2026-03-04") {
              const restoredZ = oldTimestamp.replace('+07:00', 'Z');
              correctedTime = new Date(restoredZ);
              needsUpdate = true;
            }
          }

          // JIKA DATA PERLU DIUPDATE
          if (needsUpdate && correctedTime && !isNaN(correctedTime.getTime())) {
            const offset = correctedTime.getTimezoneOffset();
            const sign = offset > 0 ? '-' : '+';
            const absOffset = Math.abs(offset);
            const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
            const offsetMinutes = String(absOffset % 60).padStart(2, '0');

            const year = correctedTime.getFullYear();
            const month = String(correctedTime.getMonth() + 1).padStart(2, '0');
            const day = String(correctedTime.getDate()).padStart(2, '0');
            const hours = String(correctedTime.getHours()).padStart(2, '0');
            const minutes = String(correctedTime.getMinutes()).padStart(2, '0');
            const seconds = String(correctedTime.getSeconds()).padStart(2, '0');
            const milliseconds = String(correctedTime.getMilliseconds()).padStart(3, '0');

            const newTimestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}:${offsetMinutes}`;

            if (newTimestamp !== oldTimestamp) {
              updates[`${key}/timestamp`] = newTimestamp;
              count++;
            }
          }
        });

        if (count > 0) {
          await update(attendanceRef, updates);
          setMessage(`✅ Sukses! ${count} data absensi lama berhasil dikoreksi.`);
        } else {
          setMessage(`✅ Selesai! Semua data sudah rapi, tidak ada yang perlu diperbaiki.`);
        }
        
      } else {
        setMessage('⚠️ Tidak ada data absensi ditemukan di database.');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Terjadi kesalahan. Cek console browser.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-black/40 border border-yellow-500/30 p-8 rounded-2xl backdrop-blur-sm shadow-2xl mt-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">🛠️</span>
        <h3 className="text-2xl font-black text-yellow-400 tracking-wider uppercase">Auto-Fix Database Absensi</h3>
      </div>
      
      <p className="text-white/70 mb-8 text-base leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
        Gunakan alat ini untuk mengoreksi data absensi lama yang tanggalnya mundur sehari akibat bug zona waktu. Script ini 100% aman dan akan mendeteksi data mana saja yang butuh diperbaiki secara otomatis.
      </p>

      <button
        onClick={handleFixData}
        disabled={loading}
        className="w-full py-5 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-400 text-lg font-black tracking-[0.2em] uppercase hover:bg-yellow-500/30 transition-all shadow-lg disabled:opacity-50 disabled:cursor-wait active:scale-95"
      >
        {loading ? 'MEMPROSES DATABASE...' : 'JALANKAN KOREKSI DATA SEKARANG'}
      </button>

      {message && (
        <div className={`mt-6 p-5 border rounded-xl text-center font-bold text-lg ${
          message.includes('Sukses') || message.includes('Selesai') 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}