import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

export function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');

  const units: Record<string, string[]> = {
    length: ['mm', 'cm', 'm', 'inch', 'ft', 'yard', 'mile'],
    volume: ['mL', 'L', 'gal (US)', 'gal', 'bbl', 'ft³', 'm³', 'inch³'],
    weight: ['mg', 'g', 'kg', 'oz', 'lb', 'ton'],
    flowrate: ['mL/min', 'L/min', 'L/h', 'gal/min', 'bbl/day', 'm³/h'],
    temperature: ['°C', '°F', 'K'],
    pressure: ['Pa', 'kPa', 'bar', 'psi', 'atm'],
    density: ['kg/m³', 'g/cm³', 'lb/ft³', 'API'],
  };

  // Conversion factors to base unit (meter, liter, gram, etc.)
  const conversionRates: Record<string, Record<string, number>> = {
    length: { mm: 0.001, cm: 0.01, m: 1, inch: 0.0254, ft: 0.3048, yard: 0.9144, mile: 1609.344 },
    volume: { mL: 0.001, L: 1, 'gal (US)': 3.78541, gal: 3.78541, bbl: 158.987, 'ft³': 28.3168, 'm³': 1000, 'inch³': 0.0163871 },
    weight: { mg: 0.001, g: 1, kg: 1000, oz: 28.3495, lb: 453.592, ton: 907185 },
    flowrate: { 'mL/min': 0.001, 'L/min': 1, 'L/h': 1/60, 'gal/min': 3.78541, 'bbl/day': 158.987/1440, 'm³/h': 1000/60 },
    pressure: { Pa: 1, kPa: 1000, bar: 100000, psi: 6894.76, atm: 101325 },
    density: { 'kg/m³': 1, 'g/cm³': 1000, 'lb/ft³': 16.0185, API: 0 },
  };

  const convert = (): string => {
    if (!inputValue || !fromUnit || !toUnit) return '';
    const value = parseFloat(inputValue);
    if (isNaN(value)) return '';

    // Temperature conversion (special case)
    if (category === 'temperature') {
      let celsius: number;
      if (fromUnit === '°C') celsius = value;
      else if (fromUnit === '°F') celsius = (value - 32) * 5/9;
      else celsius = value - 273.15;

      if (toUnit === '°C') return celsius.toFixed(4);
      if (toUnit === '°F') return (celsius * 9/5 + 32).toFixed(4);
      if (toUnit === 'K') return (celsius + 273.15).toFixed(4);
    }

    // API Gravity conversion (special case)
    if (category === 'density' && (fromUnit === 'API' || toUnit === 'API')) {
      // API to specific gravity: SG = 141.5 / (API + 131.5)
      // Specific gravity to kg/m³: kg/m³ = SG * 999.016 (density of water at 60°F in kg/m³)
      if (fromUnit === 'API' && toUnit === 'kg/m³') {
        const sg = 141.5 / (value + 131.5);
        const density = sg * 999.016;
        return density.toFixed(4);
      }
      if (fromUnit === 'kg/m³' && toUnit === 'API') {
        const sg = value / 999.016;
        const api = (141.5 / sg) - 131.5;
        return api.toFixed(4);
      }
      if (fromUnit === 'API' && toUnit === 'g/cm³') {
        const sg = 141.5 / (value + 131.5);
        return sg.toFixed(4);
      }
      if (fromUnit === 'g/cm³' && toUnit === 'API') {
        const api = (141.5 / value) - 131.5;
        return api.toFixed(4);
      }
      if (fromUnit === 'API' && toUnit === 'lb/ft³') {
        const sg = 141.5 / (value + 131.5);
        const density = sg * 62.428;
        return density.toFixed(4);
      }
      if (fromUnit === 'lb/ft³' && toUnit === 'API') {
        const sg = value / 62.428;
        const api = (141.5 / sg) - 131.5;
        return api.toFixed(4);
      }
    }

    // Standard conversion: from unit -> base unit -> to unit
    const rates = conversionRates[category];
    if (!rates || rates[fromUnit] === undefined || rates[toUnit] === undefined) return '';
    
    // If same unit, return original value
    if (fromUnit === toUnit) return value.toString();
    
    // Convert to base unit first, then to target unit
    const baseValue = value * rates[fromUnit];
    const result = baseValue / rates[toUnit];
    
    // Format result intelligently
    if (result === 0) return '0';
    if (Math.abs(result) < 0.0001 || Math.abs(result) >= 1000000) {
      return result.toExponential(4);
    }
    // Remove trailing zeros and limit to reasonable decimal places
    return parseFloat(result.toFixed(6)).toString();
  };

  return (
    <ToolLayout title="Unit Converter">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setFromUnit('');
              setToUnit('');
            }}
            className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100"
          >
            {Object.keys(units).map((cat) => (
              <option key={cat} value={cat} className="text-gray-900">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Value</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">From</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100"
            >
              <option value="" className="text-gray-900">Select</option>
              {units[category].map((u) => (
                <option key={u} value={u} className="text-gray-900">{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100"
            >
              <option value="" className="text-gray-900">Select</option>
              {units[category].map((u) => (
                <option key={u} value={u} className="text-gray-900">{u}</option>
              ))}
            </select>
          </div>
        </div>

        {inputValue && fromUnit && toUnit && (
          <div className="bg-primary/10 p-4 rounded-card text-center border border-primary/20">
            <p className="text-sm text-gray-400">{inputValue} {fromUnit} =</p>
            <p className="text-xl font-semibold text-primary">{convert()} {toUnit}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
