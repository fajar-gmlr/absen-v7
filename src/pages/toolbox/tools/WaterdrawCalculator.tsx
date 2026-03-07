import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';

type ViewState = 'menu' | 'displacer' | 'master';

interface RunData {
  pulse: string;
  pressure: string;
  reading: string;
  temperature: string;
}

export function WaterdrawCalculator() {
  // ==========================================
  // STATE: Navigasi
  // ==========================================
  const [currentView, setCurrentView] = useState<ViewState>('menu');

  // ==========================================
  // STATE & LOGIC: Displacer Calculator
  // ==========================================
  const [ndValue, setNdValue] = useState('');
  const [ndUnit, setNdUnit] = useState('inch');
  const [wtValue, setWtValue] = useState('');
  const [wtUnit, setWtUnit] = useState('inch');
  const [inputType, setInputType] = useState<'percent' | 'circumference'>('percent');
  const [measureValue, setMeasureValue] = useState('');

  const calculateDisplacer = () => {
    const ndNum = parseFloat(ndValue.replace(',', '.'));
    const wtNum = parseFloat(wtValue.replace(',', '.'));
    const measureNum = parseFloat(measureValue.replace(',', '.'));

    if (isNaN(ndNum) || isNaN(wtNum) || isNaN(measureNum)) return null;

    const ndInMm = ndUnit === 'mm' ? ndNum : ndNum * 25.4;
    const wtInMm = wtUnit === 'mm' ? wtNum : wtNum * 25.4;

    const idInMm = ndInMm - (2 * wtInMm);
    const idInInch = idInMm / 25.4;

    if (idInMm <= 0) return null;

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

  const displacerResults = calculateDisplacer();

  // ==========================================
  // STATE & LOGIC: Master Vs Bejana
  // ==========================================
  const [kFactor, setKFactor] = useState('');
  const [nominalVolume, setNominalVolume] = useState('');
  const [correctedNominal, setCorrectedNominal] = useState('');
  const [mainScale, setMainScale] = useState('');
  const [correctedScale, setCorrectedScale] = useState('');
  const [thermalCoef, setThermalCoef] = useState('');

  const [runs, setRuns] = useState<RunData[]>([
    { pulse: '', pressure: '', reading: '', temperature: '' },
    { pulse: '', pressure: '', reading: '', temperature: '' },
    { pulse: '', pressure: '', reading: '', temperature: '' },
    { pulse: '', pressure: '', reading: '', temperature: '' },
    { pulse: '', pressure: '', reading: '', temperature: '' },
  ]);

  const updateRunData = (index: number, field: keyof RunData, value: string) => {
    const newRuns = [...runs];
    newRuns[index] = { ...newRuns[index], [field]: value };
    setRuns(newRuns);
  };

  const masterResults = useMemo(() => {
    const pKF = parseFloat(kFactor.replace(',', '.'));
    const pNomVol = parseFloat(nominalVolume.replace(',', '.'));
    const pCorrNom = parseFloat(correctedNominal.replace(',', '.'));
    const pMainScale = parseFloat(mainScale.replace(',', '.'));
    const pCorrScale = parseFloat(correctedScale.replace(',', '.'));
    const pThermCoef = parseFloat(thermalCoef.replace(',', '.'));

    const calculatedRuns = runs.map((run) => {
      let mf: number | null = null;
      const pPulse = parseFloat(run.pulse.replace(',', '.'));
      const pPress = parseFloat(run.pressure.replace(',', '.'));
      const pRead = parseFloat(run.reading.replace(',', '.'));
      const pTemp = parseFloat(run.temperature.replace(',', '.'));

      if (
        !isNaN(pPulse) && !isNaN(pPress) && !isNaN(pRead) && !isNaN(pTemp) &&
        !isNaN(pKF) && !isNaN(pNomVol) && !isNaN(pCorrNom) && 
        !isNaN(pMainScale) && !isNaN(pCorrScale) && !isNaN(pThermCoef)
      ) {
        // CPL = 1 / (1 - (0.0000032 * pressure))
        const cpl = 1 / (1 - 0.0000032 * pPress);
        // CTL = 1 + thermalCoef * (temperature - 15.6)
        const ctl = 1 + pThermCoef * (pTemp - 15.6);

        const masterVolume = (pPulse / pKF) * cpl;
        const scaleFactor = pCorrScale / pMainScale;
        const realVolumeBejana = (pRead * scaleFactor) / 1000 + pCorrNom * ctl;

        if (masterVolume !== 0) {
          mf = realVolumeBejana / masterVolume;
        }
      }
      return { ...run, mf };
    });

    const validMFs = calculatedRuns.map((r) => r.mf).filter((m): m is number => m !== null);
    let repeatability: number | null = null;
    let maxRunIndex: number | null = null;
    let minRunIndex: number | null = null;

    if (validMFs.length >= 2) {
      const maxMF = Math.max(...validMFs);
      const minMF = Math.min(...validMFs);
      repeatability = (maxMF - minMF) * 100;
      maxRunIndex = calculatedRuns.findIndex((r) => r.mf === maxMF) + 1;
      minRunIndex = calculatedRuns.findIndex((r) => r.mf === minMF) + 1;
    }

    return { calculatedRuns, repeatability, maxRunIndex, minRunIndex };
  }, [kFactor, nominalVolume, correctedNominal, mainScale, correctedScale, thermalCoef, runs]);

  // ==========================================
  // RENDER: Views
  // ==========================================
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

  const renderDisplacer = () => (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => setCurrentView('menu')} className="flex items-center text-sm font-medium text-primary hover:text-sky-400 mb-6 transition-colors">
        <span className="mr-2">←</span> Kembali ke Menu
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nominal Diameter (ND)</label>
          <div className="flex">
            <input type="text" inputMode="decimal" value={ndValue} onChange={(e) => setNdValue(e.target.value)} className="w-full p-3 border border-gray-700 rounded-l-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: 30" />
            <select value={ndUnit} onChange={(e) => setNdUnit(e.target.value)} className="p-3 border-y border-r border-gray-700 rounded-r-card bg-gray-700 text-gray-100 outline-none">
              <option value="inch">inch</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Wall Thickness (WT)</label>
          <div className="flex">
            <input type="text" inputMode="decimal" value={wtValue} onChange={(e) => setWtValue(e.target.value)} className="w-full p-3 border border-gray-700 rounded-l-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: 0.5" />
            <select value={wtUnit} onChange={(e) => setWtUnit(e.target.value)} className="p-3 border-y border-r border-gray-700 rounded-r-card bg-gray-700 text-gray-100 outline-none">
              <option value="inch">inch</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Pengukuran Bola</label>
        <div className="flex">
          <input type="text" inputMode="decimal" value={measureValue} onChange={(e) => setMeasureValue(e.target.value)} className="w-full p-3 border border-gray-700 rounded-l-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" placeholder={inputType === 'percent' ? "Contoh: 103" : "Masukkan keliling dalam mm"} />
          <select value={inputType} onChange={(e) => { setInputType(e.target.value as 'percent' | 'circumference'); setMeasureValue(''); }} className="p-3 border-y border-r border-gray-700 rounded-r-card bg-gray-700 text-gray-100 outline-none min-w-[140px]">
            <option value="percent">% Pembesaran</option>
            <option value="circumference">Keliling (mm)</option>
          </select>
        </div>
      </div>

      {displacerResults && (
        <div className="bg-primary/10 p-5 rounded-card text-center border border-primary/20 mt-6 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Hasil Perhitungan Displacer</p>
          <div className="bg-gray-800/80 p-3 rounded-card border border-gray-700 mt-2">
            <p className="text-xs text-gray-400 mb-1">Internal Diameter (ID) Pipa</p>
            <p className="text-md font-medium text-gray-300">{displacerResults.idInch} inch / {displacerResults.idMm} mm</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-gray-800 p-3 rounded-card border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Diameter Bola (mm)</p>
              <p className="text-lg font-bold text-primary">{displacerResults.diameterMm}</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-card border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Diameter Bola (inch)</p>
              <p className="text-lg font-bold text-primary">{displacerResults.diameterInch}</p>
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-card border border-gray-700 mt-2">
            <p className="text-xs text-gray-400 mb-1">Persentase Pembesaran vs ID</p>
            <p className="text-xl font-bold text-success">{displacerResults.percent}%</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderMaster = () => (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => setCurrentView('menu')} className="flex items-center text-sm font-medium text-primary hover:text-sky-400 transition-colors">
        <span className="mr-2">←</span> Kembali ke Menu
      </button>

      {/* Section 1: Specification */}
      <div>
        <h4 className="text-md font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">1. Specification</h4>
        
        <p className="text-sm font-medium text-gray-400 mb-2">Master Meter</p>
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">K-Factor (pulse/liter)</label>
          <input type="text" inputMode="decimal" value={kFactor} onChange={(e) => setKFactor(e.target.value)} className="w-full md:w-1/2 p-2 border border-gray-700 rounded-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <p className="text-sm font-medium text-gray-400 mb-2 mt-4">Bejana</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nominal Volume (liter)</label>
            <input type="text" inputMode="decimal" value={nominalVolume} onChange={(e) => setNominalVolume(e.target.value)} className="w-full p-2 border border-gray-700 rounded-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Corrected Nominal (liter)</label>
            <input type="text" inputMode="decimal" value={correctedNominal} onChange={(e) => setCorrectedNominal(e.target.value)} className="w-full p-2 border border-gray-700 rounded-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Main Scale (mL)</label>
            <input type="text" inputMode="decimal" value={mainScale} onChange={(e) => setMainScale(e.target.value)} className="w-full p-2 border border-gray-700 rounded-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Corrected Scale (mL)</label>
            <input type="text" inputMode="decimal" value={correctedScale} onChange={(e) => setCorrectedScale(e.target.value)} className="w-full p-2 border border-gray-700 rounded-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Thermal Coef. (/°C)</label>
            <input type="text" inputMode="decimal" value={thermalCoef} onChange={(e) => setThermalCoef(e.target.value)} className="w-full p-2 border border-gray-700 rounded-card bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
      </div>

      {/* Section 2: Field Data */}
      <div>
        <h4 className="text-md font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">2. Field Data</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="p-2 text-sm font-medium text-gray-300">Run</th>
                <th className="p-2 text-sm font-medium text-gray-300">Pulse</th>
                <th className="p-2 text-sm font-medium text-gray-300">Press (psi)</th>
                <th className="p-2 text-sm font-medium text-gray-300">Reading (mL)</th>
                <th className="p-2 text-sm font-medium text-gray-300">Temp (°C)</th>
                <th className="p-2 text-sm font-medium text-gray-300">Meter Factor (MF)</th>
              </tr>
            </thead>
            <tbody>
              {masterResults.calculatedRuns.map((run, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-2 text-sm text-gray-400">{index + 1}</td>
                  <td className="p-1">
                    <input type="text" inputMode="decimal" value={run.pulse} onChange={(e) => updateRunData(index, 'pulse', e.target.value)} className="w-full p-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-100" />
                  </td>
                  <td className="p-1">
                    <input type="text" inputMode="decimal" value={run.pressure} onChange={(e) => updateRunData(index, 'pressure', e.target.value)} className="w-full p-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-100" />
                  </td>
                  <td className="p-1">
                    <input type="text" inputMode="decimal" value={run.reading} onChange={(e) => updateRunData(index, 'reading', e.target.value)} className="w-full p-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-100" />
                  </td>
                  <td className="p-1">
                    <input type="text" inputMode="decimal" value={run.temperature} onChange={(e) => updateRunData(index, 'temperature', e.target.value)} className="w-full p-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-100" />
                  </td>
                  <td className={`p-2 font-mono text-sm ${run.mf !== null ? 'text-primary font-bold' : 'text-gray-500'}`}>
                    {run.mf !== null ? run.mf.toFixed(6) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Box */}
      {masterResults.repeatability !== null && (
        <div className="bg-success/10 border border-success/30 p-5 rounded-card flex flex-col md:flex-row gap-6 justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Repeatability</p>
            <p className="text-3xl font-bold text-success">{masterResults.repeatability.toFixed(6)}%</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Largest Difference</p>
            <p className="text-sm text-gray-300">
              Between Run <strong className="text-white">{masterResults.maxRunIndex}</strong> (max) & Run <strong className="text-white">{masterResults.minRunIndex}</strong> (min)
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const getLayoutTitle = () => {
    if (currentView === 'displacer') return 'Displacer Calculator';
    if (currentView === 'master') return 'Master Vs Bejana Calculator';
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