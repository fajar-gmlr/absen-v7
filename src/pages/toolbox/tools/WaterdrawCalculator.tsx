import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

type ViewState = 'menu' | 'displacer' | 'master';

export function WaterdrawCalculator() {
  // State untuk navigasi halaman
  const [currentView, setCurrentView] = useState<ViewState>('menu');

  // State untuk Displacer Calculator
  const [ndValue, setNdValue] = useState('');
  const [ndUnit, setNdUnit] = useState('inch');
  const [wtValue, setWtValue] = useState('');
  const [wtUnit, setWtUnit] = useState('inch');
  const [inputType, setInputType] = useState<'percent' | 'circumference'>('percent');
  const [measureValue, setMeasureValue] = useState('');

  const calculateDisplacer = () => {
    // Replace koma dengan titik agar bisa dihitung dalam JavaScript
    const ndNum = parseFloat(ndValue.replace(',', '.'));
    const wtNum = parseFloat(wtValue.replace(',', '.'));
    const measureNum = parseFloat(measureValue.replace(',', '.'));

    if (isNaN(ndNum) || isNaN(wtNum) || isNaN(measureNum)) return null;

    // Standarisasi semua input ukuran pipa ke mm
    const ndInMm = ndUnit === 'mm' ? ndNum : ndNum * 25.4;
    const wtInMm = wtUnit === 'mm' ? wtNum : wtNum * 25.4;

    // Hitung Internal Diameter (ID) = Nominal Diameter - (2 * Wall Thickness)
    const idInMm = ndInMm - (2 * wtInMm);
    const idInInch = idInMm / 25.4;

    if (idInMm <= 0) return null; // Mencegah hasil minus jika input salah

    let sphereDiameterMm = 0;
    let enlargementPercent = 0;

    if (inputType === 'percent') {
      enlargementPercent = measureNum;
      sphereDiameterMm = idInMm * (measureNum / 100);
    } else {
      sphereDiameterMm = measureNum / Math.PI;
      enlargementPercent = (sphereDiameterMm / idInMm) * 100;
    }

    const sphereDiameterInch = sphereDiameterMm / 25.4;

    return {
      idMm: idInMm.toFixed(4),
      idInch: idInInch.toFixed(4),
      diameterMm: sphereDiameterMm.toFixed(4),
      diameterInch: sphereDiameterInch.toFixed(4),
      percent: enlargementPercent.toFixed(2),
    };
  };

  const results = calculateDisplacer();

  // Komponen Halaman Menu Utama
  const renderMenu = () => (
    <div className="grid grid-cols-1 gap-4 mt-4">
      <button
        onClick={() => setCurrentView('displacer')}
        className="p-6 rounded-card text-left transition-smooth holo-card text-gray-300 hover:border-neon-teal/50 flex items-center space-x-4"
      >
        <span className="text-4xl">⚙️</span>
        <div>
          <h4 className="text-lg font-medium text-gray-100">Displacer Calculator</h4>
          <p className="text-sm text-gray-400 mt-1">Hitung diameter bola (displacer) berdasarkan ukuran pipa dan pengukuran lapangan.</p>
        </div>
      </button>

      <button
        onClick={() => setCurrentView('master')}
        className="p-6 rounded-card text-left transition-smooth holo-card text-gray-300 hover:border-neon-teal/50 flex items-center space-x-4"
      >
        <span className="text-4xl">⚖️</span>
        <div>
          <h4 className="text-lg font-medium text-gray-100">Master Vs Bejana</h4>
          <p className="text-sm text-gray-400 mt-1">Kalkulasi kalibrasi prover menggunakan metode waterdraw.</p>
        </div>
      </button>
    </div>
  );

  // Komponen Halaman Displacer Calculator
  const renderDisplacer = () => (
    <div className="space-y-4">
      {/* Tombol Kembali */}
      <button 
        onClick={() => setCurrentView('menu')}
        className="flex items-center text-sm font-medium text-primary hover:text-sky-400 mb-6 transition-colors"
      >
        <span className="mr-2">←</span> Kembali ke Menu Waterdraw
      </button>

      {/* Input Nominal Diameter & Wall Thickness */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nominal Diameter (ND)</label>
          <div className="flex">
            <input
              type="text"
              inputMode="decimal"
              value={ndValue}
              onChange={(e) => setNdValue(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-l-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Contoh: 30"
            />
            <select
              value={ndUnit}
              onChange={(e) => setNdUnit(e.target.value)}
              className="p-3 border-y border-r border-gray-700 rounded-r-card bg-gray-700 text-gray-100 outline-none"
            >
              <option value="inch">inch</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Wall Thickness (WT)</label>
          <div className="flex">
            <input
              type="text"
              inputMode="decimal"
              value={wtValue}
              onChange={(e) => setWtValue(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-l-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Contoh: 0.5"
            />
            <select
              value={wtUnit}
              onChange={(e) => setWtUnit(e.target.value)}
              className="p-3 border-y border-r border-gray-700 rounded-r-card bg-gray-700 text-gray-100 outline-none"
            >
              <option value="inch">inch</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Input Pengukuran Bola */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Pengukuran Bola</label>
        <div className="flex">
          <input
            type="text"
            inputMode="decimal"
            value={measureValue}
            onChange={(e) => setMeasureValue(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-l-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none"
            placeholder={inputType === 'percent' ? "Contoh: 103" : "Masukkan keliling dalam mm"}
          />
          <select
            value={inputType}
            onChange={(e) => {
              setInputType(e.target.value as 'percent' | 'circumference');
              setMeasureValue(''); 
            }}
            className="p-3 border-y border-r border-gray-700 rounded-r-card bg-gray-700 text-gray-100 outline-none min-w-[140px]"
          >
            <option value="percent">% Pembesaran</option>
            <option value="circumference">Keliling (mm)</option>
          </select>
        </div>
      </div>

      {/* Panel Hasil Kalkulasi */}
      {results && (
        <div className="bg-primary/10 p-5 rounded-card text-center border border-primary/20 mt-6 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Hasil Perhitungan Displacer</p>
          
          {/* Display Calculated ID */}
          <div className="bg-gray-800/80 p-3 rounded-card border border-gray-700 mt-2">
            <p className="text-xs text-gray-400 mb-1">Internal Diameter (ID) Pipa</p>
            <p className="text-md font-medium text-gray-300">{results.idInch} inch / {results.idMm} mm</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-gray-800 p-3 rounded-card border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Diameter Bola (mm)</p>
              <p className="text-lg font-bold text-primary">{results.diameterMm}</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-card border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Diameter Bola (inch)</p>
              <p className="text-lg font-bold text-primary">{results.diameterInch}</p>
            </div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-card border border-gray-700 mt-2">
            <p className="text-xs text-gray-400 mb-1">Persentase Pembesaran vs ID</p>
            <p className="text-xl font-bold text-success">{results.percent}%</p>
          </div>
        </div>
      )}
    </div>
  );

  // Komponen Halaman Master Vs Bejana
  const renderMaster = () => (
    <div className="space-y-4">
      <button 
        onClick={() => setCurrentView('menu')}
        className="flex items-center text-sm font-medium text-primary hover:text-sky-400 mb-6 transition-colors"
      >
        <span className="mr-2">←</span> Kembali ke Menu Waterdraw
      </button>

      <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-card text-center mt-4">
        <p className="text-gray-300 font-medium text-xl mb-2">🚧 Master Vs Bejana</p>
        <p className="text-sm text-gray-500">Halaman ini sedang dalam tahap pengembangan dan akan segera tersedia.</p>
      </div>
    </div>
  );

  // Menentukan judul dinamis berdasarkan halaman yang aktif
  const getLayoutTitle = () => {
    if (currentView === 'displacer') return 'Displacer Calculator';
    if (currentView === 'master') return 'Master Vs Bejana';
    return 'Waterdraw Menu';
  };

  return (
    <ToolLayout title={getLayoutTitle()}>
      {currentView === 'menu' && renderMenu()}
      {currentView === 'displacer' && renderDisplacer()}
      {currentView === 'master' && renderMaster()}
    </ToolLayout>
  );
}