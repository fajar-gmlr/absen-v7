import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';

type TempUnit = 'C' | 'F';
type ReadingUnit = 'C' | 'F' | 'Ohm';
type RTDClass = 'A' | 'B' | 'C' | 'AA';

interface TestPoint {
  percent: number;
  standard: string;
  rtd: string;
}

// Rumus konversi Resistan (Ohm) ke Celcius untuk PT-100 (IEC 60751)
const ohmToCelsius = (r: number): number => {
  const R0 = 100;
  const A = 3.9083e-3;
  const B = -5.775e-7;
  const C = -4.183e-12;

  if (r >= 100) {
    // Suhu >= 0°C (Rumus Kuadratik)
    return (-A + Math.sqrt(A * A - 4 * B * (1 - r / R0))) / (2 * B);
  } else {
    // Suhu < 0°C (Menggunakan metode Newton-Raphson untuk aproksimasi akar)
    let t = (r - 100) / 0.39083; // Tebakan awal
    for (let i = 0; i < 5; i++) {
      const f = R0 * (1 + A * t + B * t * t + C * (t - 100) * t * t * t) - r;
      const df = R0 * (A + 2 * B * t + 4 * C * t * t * t - 300 * C * t * t);
      t = t - f / df;
    }
    return t;
  }
};

export function RTDCalculator() {
  const [minRange, setMinRange] = useState('0');
  const [maxRange, setMaxRange] = useState('100');
  const [rangeUnit, setRangeUnit] = useState<TempUnit>('C');
  
  const [rtdClass, setRtdClass] = useState<RTDClass>('A');
  const [readingUnit, setReadingUnit] = useState<ReadingUnit>('C');

  // 5 Titik pengujian otomatis: 0%, 25%, 50%, 75%, 100%
  const [readings, setReadings] = useState<TestPoint[]>([
    { percent: 0, standard: '', rtd: '' },
    { percent: 25, standard: '', rtd: '' },
    { percent: 50, standard: '', rtd: '' },
    { percent: 75, standard: '', rtd: '' },
    { percent: 100, standard: '', rtd: '' },
  ]);

  const updateReading = (index: number, field: keyof TestPoint, value: string) => {
    const newReadings = [...readings];
    newReadings[index] = { ...newReadings[index], [field]: value };
    setReadings(newReadings);
  };

  const results = useMemo(() => {
    const min = parseFloat(minRange.replace(',', '.'));
    const max = parseFloat(maxRange.replace(',', '.'));
    const isValidRange = !isNaN(min) && !isNaN(max) && max > min;

    let allPass = true;
    let anyTested = false;

    const calculatedPoints = readings.map((point) => {
      // 1. Hitung Target Suhu sesuai Range
      const targetTemp = isValidRange ? min + (max - min) * (point.percent / 100) : null;

      // 2. Parsing Input Standard (Kalibrator) & RTD (UUT)
      const stdNum = parseFloat(point.standard.replace(',', '.'));
      const rtdNum = parseFloat(point.rtd.replace(',', '.'));

      let tolerance = null;
      let deviation = null;
      let isPass = null;

      if (!isNaN(stdNum) && !isNaN(rtdNum)) {
        anyTested = true;

        // 3. Standarisasi Standard Temp ke Celcius
        const stdTempC = rangeUnit === 'C' ? stdNum : (stdNum - 32) * (5 / 9);
        const absTempC = Math.abs(stdTempC);

        // 4. Standarisasi RTD Reading ke Celcius
        let rtdTempC = 0;
        if (readingUnit === 'C') {
          rtdTempC = rtdNum;
        } else if (readingUnit === 'F') {
          rtdTempC = (rtdNum - 32) * (5 / 9);
        } else if (readingUnit === 'Ohm') {
          rtdTempC = ohmToCelsius(rtdNum);
        }

        // 5. Hitung Toleransi berdasarkan Kelas IEC 60751
        let tolC = 0;
        switch (rtdClass) {
          case 'AA': tolC = 0.1 + 0.0017 * absTempC; break;
          case 'A': tolC = 0.15 + 0.002 * absTempC; break;
          case 'B': tolC = 0.3 + 0.005 * absTempC; break;
          case 'C': tolC = 0.6 + 0.01 * absTempC; break;
        }

        // 6. Konversi Deviasi dan Toleransi ke Range Unit (C / F) untuk ditampilkan
        const rtdTempDisplayFormat = rangeUnit === 'C' ? rtdTempC : rtdTempC * (9 / 5) + 32;
        tolerance = rangeUnit === 'C' ? tolC : tolC * 1.8;
        deviation = rtdTempDisplayFormat - stdNum;

        // 7. Penentuan Lulus/Gagal
        isPass = Math.abs(deviation) <= tolerance;

        if (!isPass) allPass = false;
      }

      return {
        ...point,
        targetTemp,
        tolerance,
        deviation,
        isPass,
      };
    });

    return { calculatedPoints, allPass, anyTested, isValidRange };
  }, [minRange, maxRange, rangeUnit, rtdClass, readingUnit, readings]);

  return (
    <ToolLayout title="RTD PT-100 Calculator (IEC 60751)">
      <div className="space-y-6 animate-fade-in">
        <p className="text-sm text-gray-400">
          Evaluasi toleransi sensor RTD PT-100 berdasarkan standar IEC 60751. Mendukung input dalam suhu maupun resistan (Ohm).
        </p>

        {/* SECTION 1: SETTINGS */}
        <div className="bg-gray-800/50 p-4 rounded-card border border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">1. Parameter Pengujian</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Range Min</label>
              <input type="text" inputMode="decimal" value={minRange} onChange={(e) => setMinRange(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Range Max</label>
              <input type="text" inputMode="decimal" value={maxRange} onChange={(e) => setMaxRange(e.target.value)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary" placeholder="100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Range Unit</label>
              <select value={rangeUnit} onChange={(e) => setRangeUnit(e.target.value as TempUnit)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary">
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">IEC Class</label>
              <select value={rtdClass} onChange={(e) => setRtdClass(e.target.value as RTDClass)} className="w-full p-2.5 border border-gray-700 rounded-card bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-primary">
                <option value="A">Class A</option>
                <option value="B">Class B</option>
                <option value="C">Class C</option>
                <option value="AA">Class AA (1/3 DIN)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-sky-400 mb-1">RTD Input Unit</label>
              <select value={readingUnit} onChange={(e) => setReadingUnit(e.target.value as ReadingUnit)} className="w-full p-2.5 border border-sky-700 rounded-card bg-gray-800 text-sky-100 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="C">Celcius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
                <option value="Ohm">Resistance (Ω)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: TEST POINTS */}
        <div className="bg-gray-800/50 p-4 rounded-card border border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">2. Data Kalibrasi</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="p-2 text-xs font-medium text-gray-400 w-16">Titik</th>
                  <th className="p-2 text-xs font-medium text-gray-400">Target (°{rangeUnit})</th>
                  <th className="p-2 text-xs font-medium text-primary">Standard (°{rangeUnit})</th>
                  <th className="p-2 text-xs font-medium text-sky-400">RTD Read ({readingUnit === 'Ohm' ? 'Ω' : `°${readingUnit}`})</th>
                  <th className="p-2 text-xs font-medium text-gray-400">Error (°{rangeUnit})</th>
                  <th className="p-2 text-xs font-medium text-gray-400">Limit (±°{rangeUnit})</th>
                  <th className="p-2 text-xs font-medium text-gray-400 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.calculatedPoints.map((pt, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="p-2 text-sm text-gray-300 font-medium">{pt.percent}%</td>
                    <td className="p-2 text-sm text-gray-500 font-mono">
                      {pt.targetTemp !== null ? pt.targetTemp.toFixed(2) : '-'}
                    </td>
                    <td className="p-1">
                      <input type="text" inputMode="decimal" value={pt.standard} onChange={(e) => updateReading(index, 'standard', e.target.value)} placeholder="0.00" className="w-full md:w-24 p-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-100 focus:ring-1 focus:ring-primary outline-none" />
                    </td>
                    <td className="p-1">
                      <input type="text" inputMode="decimal" value={pt.rtd} onChange={(e) => updateReading(index, 'rtd', e.target.value)} placeholder="0.00" className="w-full md:w-24 p-2 bg-gray-900 border border-sky-700 rounded text-sm text-gray-100 focus:ring-1 focus:ring-sky-400 outline-none" />
                    </td>
                    <td className={`p-2 text-sm font-mono ${pt.deviation !== null ? (Math.abs(pt.deviation) > (pt.tolerance || 0) ? 'text-red-400' : 'text-gray-300') : 'text-gray-500'}`}>
                      {pt.deviation !== null ? (pt.deviation > 0 ? '+' : '') + pt.deviation.toFixed(3) : '-'}
                    </td>
                    <td className="p-2 text-sm font-mono text-gray-400">
                      {pt.tolerance !== null ? `±${pt.tolerance.toFixed(3)}` : '-'}
                    </td>
                    <td className="p-2 text-center">
                      {pt.isPass === true && <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full font-bold uppercase tracking-wider">Pass</span>}
                      {pt.isPass === false && <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-bold uppercase tracking-wider">Fail</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: FINAL RESULT OVERVIEW */}
        {results.anyTested && (
          <div className={`mt-6 p-5 rounded-card border flex items-center justify-between ${results.allPass ? 'bg-success/10 border-success/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Kesimpulan Pengujian</p>
              <p className={`text-lg font-medium ${results.allPass ? 'text-success' : 'text-red-400'}`}>
                {results.allPass ? `Sensor RTD memenuhi kriteria ${rtdClass}` : `Sensor RTD TIDAK memenuhi kriteria ${rtdClass}`}
              </p>
            </div>
            <div className={`text-4xl font-bold ${results.allPass ? 'text-success' : 'text-red-400'}`}>
              {results.allPass ? '✓' : '✗'}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}