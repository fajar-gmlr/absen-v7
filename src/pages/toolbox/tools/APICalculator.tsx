import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

export function APICalculator() {
  const [activeTab, setActiveTab] = useState<'table54' | 'table6'>('table54');

  // ==========================================
  // STATE: Table 54 (Metric)
  // ==========================================
  const [den15, setDen15] = useState('');
  const [tempC, setTempC] = useState('');
  const [press54, setPress54] = useState('');
  const [fFact54, setFFact54] = useState('0.0000032'); // Default Compressibility
  
  // ==========================================
  // STATE: Table 6 (US Customary)
  // ==========================================
  const [api60, setApi60] = useState('');
  const [tempF, setTempF] = useState('');
  const [press6, setPress6] = useState('');
  const [fFact6, setFFact6] = useState('0.0000032'); // Default Compressibility

  // ==========================================
  // CALCULATIONS: Table 54 (Metric)
  // ==========================================
  const calculateTab54 = () => {
    // Parsing Input
    const d = parseFloat(den15.replace(',', '.'));
    const t = parseFloat(tempC.replace(',', '.'));
    const p = parseFloat(press54.replace(',', '.'));
    const f = parseFloat(fFact54.replace(',', '.'));

    let ctl: number | null = null;
    let cpl: number | null = null;

    // Hitung CTL (Pendekatan Crude Oil Tabel 54A)
    if (!isNaN(d) && !isNaN(t) && d > 0) {
      const K0 = 613.9723;
      const alpha = K0 / (d * d);
      const deltaT = t - 15;
      ctl = Math.exp(-alpha * deltaT * (1 + 0.8 * alpha * deltaT));
    }

    // Hitung CPL
    if (!isNaN(p) && !isNaN(f)) {
      cpl = 1 / (1 - (p * f));
    }

    // Hitung CTPL (Combined Factor)
    const ctpl = (ctl !== null && cpl !== null) ? ctl * cpl : null;

    return { ctl, cpl, ctpl };
  };

  // ==========================================
  // CALCULATIONS: Table 6 (US Customary)
  // ==========================================
  const calculateTab6 = () => {
    // Parsing Input
    const a = parseFloat(api60.replace(',', '.'));
    const t = parseFloat(tempF.replace(',', '.'));
    const p = parseFloat(press6.replace(',', '.'));
    const f = parseFloat(fFact6.replace(',', '.'));

    let ctl: number | null = null;
    let cpl: number | null = null;

    // Hitung CTL (Pendekatan Crude Oil Tabel 6A)
    if (!isNaN(a) && !isNaN(t)) {
      const K0 = 341.0957;
      const sg = 141.5 / (a + 131.5);
      const density60 = sg * 999.012; 
      const alpha = K0 / (density60 * density60);
      const deltaT = t - 60;
      ctl = Math.exp(-alpha * deltaT * (1 + 0.8 * alpha * deltaT));
    }

    // Hitung CPL
    if (!isNaN(p) && !isNaN(f)) {
      cpl = 1 / (1 - (p * f));
    }

    // Hitung CTPL (Combined Factor)
    const ctpl = (ctl !== null && cpl !== null) ? ctl * cpl : null;

    return { ctl, cpl, ctpl };
  };

  const res54 = calculateTab54();
  const res6 = calculateTab6();

  return (
    <ToolLayout title="API Calculator (CTL & CPL)">
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 p-1 bg-gray-800 rounded-card border border-gray-700">
        <button 
          onClick={() => setActiveTab('table54')} 
          className={`flex-1 py-2 text-sm font-medium rounded-card transition-smooth ${activeTab === 'table54' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Table 54 (Metric)
        </button>
        <button 
          onClick={() => setActiveTab('table6')} 
          className={`flex-1 py-2 text-sm font-medium rounded-card transition-smooth ${activeTab === 'table6' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Table 6 (US Customary)
        </button>
      </div>

      {/* VIEW: TABLE 54 (METRIC) */}
      {activeTab === 'table54' && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-sm text-gray-400">Kalkulasi faktor koreksi cairan berdasarkan Standard Suhu 15°C (Crude Oil - Tabel 54A).</p>
          
          {/* Section 1: Suhu (CTL) */}
          <div className="bg-gray-800/50 p-4 rounded-card border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">1. Parameter Suhu (CTL)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Density @ 15°C (kg/m³)</label>
                <input type="text" inputMode="decimal" value={den15} onChange={(e) => setDen15(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" placeholder="Contoh: 846.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Observed Temp (°C)</label>
                <input type="text" inputMode="decimal" value={tempC} onChange={(e) => setTempC(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" placeholder="Contoh: 31.0" />
              </div>
            </div>
          </div>

          {/* Section 2: Tekanan (CPL) */}
          <div className="bg-gray-800/50 p-4 rounded-card border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">2. Parameter Tekanan (CPL)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Pressure (bar/kPa)</label>
                <input type="text" inputMode="decimal" value={press54} onChange={(e) => setPress54(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" placeholder="Contoh: 15.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Compressibility (F)</label>
                <input type="text" inputMode="decimal" value={fFact54} onChange={(e) => setFFact54(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-card text-center border ${res54.ctl !== null ? 'bg-primary/10 border-primary/30' : 'bg-gray-800 border-gray-700'}`}>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CTL (Table 54)</p>
              <p className={`text-xl font-bold ${res54.ctl !== null ? 'text-primary' : 'text-gray-600'}`}>{res54.ctl !== null ? res54.ctl.toFixed(5) : '0.00000'}</p>
            </div>
            <div className={`p-4 rounded-card text-center border ${res54.cpl !== null ? 'bg-sky-500/10 border-sky-500/30' : 'bg-gray-800 border-gray-700'}`}>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CPL</p>
              <p className={`text-xl font-bold ${res54.cpl !== null ? 'text-sky-400' : 'text-gray-600'}`}>{res54.cpl !== null ? res54.cpl.toFixed(5) : '0.00000'}</p>
            </div>
          </div>

          {res54.ctpl !== null && (
            <div className="bg-success/10 p-5 rounded-card text-center border border-success/30">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CTPL (Combined Factor)</p>
              <p className="text-3xl font-bold text-success">{res54.ctpl.toFixed(5)}</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW: TABLE 6 (US CUSTOMARY) */}
      {activeTab === 'table6' && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-sm text-gray-400">Kalkulasi faktor koreksi cairan berdasarkan Standard Suhu 60°F (Crude Oil - Tabel 6A).</p>
          
          {/* Section 1: Suhu (CTL) */}
          <div className="bg-gray-800/50 p-4 rounded-card border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">1. Parameter Suhu (CTL)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">API Gravity @ 60°F</label>
                <input type="text" inputMode="decimal" value={api60} onChange={(e) => setApi60(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" placeholder="Contoh: 40.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Observed Temp (°F)</label>
                <input type="text" inputMode="decimal" value={tempF} onChange={(e) => setTempF(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" placeholder="Contoh: 81.5" />
              </div>
            </div>
          </div>

          {/* Section 2: Tekanan (CPL) */}
          <div className="bg-gray-800/50 p-4 rounded-card border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">2. Parameter Tekanan (CPL)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Pressure (psi)</label>
                <input type="text" inputMode="decimal" value={press6} onChange={(e) => setPress6(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" placeholder="Contoh: 150" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Compressibility (F)</label>
                <input type="text" inputMode="decimal" value={fFact6} onChange={(e) => setFFact6(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-card text-center border ${res6.ctl !== null ? 'bg-primary/10 border-primary/30' : 'bg-gray-800 border-gray-700'}`}>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CTL (Table 6)</p>
              <p className={`text-xl font-bold ${res6.ctl !== null ? 'text-primary' : 'text-gray-600'}`}>{res6.ctl !== null ? res6.ctl.toFixed(5) : '0.00000'}</p>
            </div>
            <div className={`p-4 rounded-card text-center border ${res6.cpl !== null ? 'bg-sky-500/10 border-sky-500/30' : 'bg-gray-800 border-gray-700'}`}>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CPL</p>
              <p className={`text-xl font-bold ${res6.cpl !== null ? 'text-sky-400' : 'text-gray-600'}`}>{res6.cpl !== null ? res6.cpl.toFixed(5) : '0.00000'}</p>
            </div>
          </div>

          {res6.ctpl !== null && (
            <div className="bg-success/10 p-5 rounded-card text-center border border-success/30">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CTPL (Combined Factor)</p>
              <p className="text-3xl font-bold text-success">{res6.ctpl.toFixed(5)}</p>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}