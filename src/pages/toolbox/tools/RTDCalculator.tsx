import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';

type TempUnit = 'C' | 'F';
type ReadingUnit = 'C' | 'F' | 'Ohm';
type RTDClass = 'A' | 'B' | 'C' | 'AA';

interface TestPoint {
  percent: number;
  rtd: string;
}

// Rumus konversi Celcius ke Resistan (Ohm) untuk PT-100 (IEC 60751)
const celsiusToOhm = (t: number): number => {
  const R0 = 100;
  const A = 3.9083e-3;
  const B = -5.775e-7;
  const C = -4.183e-12;

  if (t >= 0) {
    return R0 * (1 + A * t + B * t * t);
  } else {
    return R0 * (1 + A * t + B * t * t + C * (t - 100) * t * t * t);
  }
};

export function RTDCalculator() {
  const [minRange, setMinRange] = useState('0');
  const [maxRange, setMaxRange] = useState('100');
  const [rangeUnit, setRangeUnit] = useState<TempUnit>('C');
  
  const [rtdClass, setRtdClass] = useState<RTDClass>('A');
  const [readingUnit, setReadingUnit] = useState<ReadingUnit>('Ohm');

  // 5 Titik pengujian otomatis: 0%, 25%, 50%, 75%, 100%
  // Kolom "Standard" dihapus karena Target otomatis menjadi Standard mutlak
  const [readings, setReadings] = useState<TestPoint[]>([
    { percent: 0, rtd: '' },
    { percent: 25, rtd: '' },
    { percent: 50, rtd: '' },
    { percent: 75, rtd: '' },
    { percent: 100, rtd: '' },
  ]);

  const updateReading = (index: number, value: string) => {
    const newReadings = [...readings];
    newReadings[index].rtd = value;
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
      const targetTempRangeUnit = isValidRange ? min + (max - min) * (point.percent / 100) : null;
      let targetTempC = 0;
      
      if (targetTempRangeUnit !== null) {
        targetTempC = rangeUnit === 'C' ? targetTempRangeUnit : (targetTempRangeUnit - 32) * (5 / 9);
      }

      const rtdNum = parseFloat(point.rtd.replace(',', '.'));

      let expectedValue = null;
      let tolerance = null;
      let deviation = null;
      let isPass = null;

      if (targetTempRangeUnit !== null) {
        // 2. Hitung Toleransi Dasar dalam Celcius (Berdasarkan Kelas IEC 60751)
        const absTempC = Math.abs(targetTempC);
        let tolC = 0;
        switch (rtdClass) {
          case 'AA': tolC = 0.1 + 0.0017 * absTempC; break;
          case 'A': tolC = 0.15 + 0.002 * absTempC; break;
          case 'B': tolC = 0.3 + 0.005 * absTempC; break;
          case 'C': tolC = 0.6 + 0.01 * absTempC; break;
        }

        // 3. Konversi Target Suhu (Expected) & Toleransi ke Unit Input Pembacaan RTD
        if (readingUnit === 'C') {
          expectedValue = targetTempC;
          tolerance = tolC;
        } else if (readingUnit === 'F') {
          expectedValue = targetTempC * 1.8 + 32;
          tolerance = tolC * 1.8;
        } else if (readingUnit === 'Ohm') {
          expectedValue = celsiusToOhm(targetTempC);
          // Konversi nilai suhu + toleransi ke bentuk Ohm untuk mendapatkan selisih/limit toleransi Ohm 
          const ohmPlusTolerance = celsiusToOhm(targetTempC + tolC);
          tolerance = Math.abs(ohmPlusTolerance - expectedValue);
        }

        // 4. Hitung Deviasi (Error) & Penentuan Lulus/Gagal
        if (!isNaN(rtdNum)) {
          anyTested = true;
          deviation = rtdNum - (expectedValue ?? 0);
          isPass = Math.abs(deviation) <= (tolerance ?? 0);
          if (!isPass) allPass = false;
        }
      }

      return {
        ...point,
        targetTemp: targetTempRangeUnit,
        expectedValue,
        tolerance,
        deviation,
        isPass,
      };
    });

    return { calculatedPoints, allPass, anyTested, isValidRange };
  }, [minRange, maxRange, rangeUnit, rtdClass, readingUnit, readings]);

  const getUnitSymbol = (unit: TempUnit | ReadingUnit) => {
    if (unit === 'Ohm') return 'Ω';
    return `°${unit}`;
  };

  return (
    <ToolLayout title="RTD PT-100 Calculator (IEC 60751)">
      <div className="space-y-6 animate-fade-in">
        <p className="text-sm text-gray-400">
          Evaluasi toleransi sensor RTD PT-100 berdasarkan standar IEC 60751. Error dan Limit akan dikalkulasi sesuai dengan satuan pembacaan (Input Unit).
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
                <option value="Ohm">Resistance (Ω)</option>
                <option value="C">Celcius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: TEST POINTS */}
        <div className="bg-gray-800/50 p-4 rounded-card border border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">2. Data Kalibrasi</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="p-2 text-xs font-medium text-gray-400 w-16">Titik</th>
                  <th className="p-2 text-xs font-medium text-gray-400">Target ({getUnitSymbol(rangeUnit)})</th>
                  <th className="p-2 text-xs font-medium text-emerald-400">Nilai Referensi ({getUnitSymbol(readingUnit)})</th>
                  <th className="p-2 text-xs font-medium text-sky-400">RTD Read ({getUnitSymbol(readingUnit)})</th>
                  <th className="p-2 text-xs font-medium text-gray-400">Error ({getUnitSymbol(readingUnit)})</th>
                  <th className="p-2 text-xs font-medium text-gray-400">Limit (±{getUnitSymbol(readingUnit)})</th>
                  <th className="p-2 text-xs font-medium text-gray-400 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.calculatedPoints.map((pt, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="p-2 text-sm text-gray-300 font-medium">{pt.percent}%</td>
                    
                    {/* Suhu Target (Range) */}
                    <td className="p-2 text-sm text-gray-500 font-mono">
                      {pt.targetTemp !== null ? pt.targetTemp.toFixed(2) : '-'}
                    </td>
                    
                    {/* Nilai Konversi Target berdasarkan Input Unit */}
                    <td className="p-2 text-sm text-emerald-400/80 font-mono">
                      {pt.expectedValue !== null ? pt.expectedValue.toFixed(3) : '-'}
                    </td>
                    
                    {/* Input RTD Read */}
                    <td className="p-1">
                      <input 
                        type="text" 
                        inputMode="decimal" 
                        value={pt.rtd} 
                        onChange={(e) => updateReading(index, e.target.value)} 
                        placeholder="0.000" 
                        className="w-full md:w-28 p-2 bg-gray-900 border border-sky-700 rounded text-sm text-gray-100 focus:ring-1 focus:ring-sky-400 outline-none font-mono" 
                      />
                    </td>
                    
                    {/* Error & Limit (Sama dengan Unit RTD) */}
                    <td className={`p-2 text-sm font-mono ${pt.deviation !== null ? (Math.abs(pt.deviation) > (pt.tolerance || 0) ? 'text-red-400' : 'text-gray-300') : 'text-gray-500'}`}>
                      {pt.deviation !== null ? (pt.deviation > 0 ? '+' : '') + pt.deviation.toFixed(3) : '-'}
                    </td>
                    <td className="p-2 text-sm font-mono text-gray-400">
                      {pt.tolerance !== null ? `±${pt.tolerance.toFixed(3)}` : '-'}
                    </td>
                    
                    {/* Status */}
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
                {results.allPass ? `Sensor RTD memenuhi kriteria Class ${rtdClass}` : `Sensor RTD TIDAK memenuhi kriteria Class ${rtdClass}`}
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