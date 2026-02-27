import { useState } from 'react';
import { Layout } from '../components/Layout';
import { linearInterpolation } from '../utils/toolboxCalculations';



type ToolType = 'calculator' | 'converter' | 'interpolation' | 'waterdraw' | 'api1952';

export function Toolbox() {
  const [activeTool, setActiveTool] = useState<ToolType>('calculator');

  const tools: { id: ToolType; name: string; icon: string }[] = [
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'converter', name: 'Unit Converter', icon: '📐' },
    { id: 'interpolation', name: 'Linear Interpolation', icon: '📈' },
    { id: 'waterdraw', name: 'Waterdraw', icon: '💧' },
    { id: 'api1952', name: 'API 1952', icon: '⚗️' },
  ];

  return (
    <Layout title="Toolbox">
      <div className="p-4">
        {/* Tool Selection Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-4 rounded-card text-center transition-smooth card-3d ${
                activeTool === tool.id
                  ? 'bg-primary text-white border-primary'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-2xl">{tool.icon}</span>
              <p className="mt-2 font-medium">{tool.name}</p>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="card-3d p-4">
          {activeTool === 'calculator' && <GeneralCalculator />}
          {activeTool === 'converter' && <UnitConverter />}
          {activeTool === 'interpolation' && <LinearInterpolation />}
          {activeTool === 'waterdraw' && <WaterdrawCalculator />}
          {activeTool === 'api1952' && <APICalculator />}
        </div>
      </div>
    </Layout>
  );
}

// General Calculator Component
function GeneralCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    setDisplay(String(-parseFloat(display)));
  };

  const percentage = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operation) {
        case '+': result = currentValue + inputValue; break;
        case '-': result = currentValue - inputValue; break;
        case '×': result = currentValue * inputValue; break;
        case '÷': result = currentValue / inputValue; break;
        default: result = inputValue;
      }

      setDisplay(String(result));
      setHistory([...history, `${currentValue} ${operation} ${inputValue} = ${result}`]);
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const equals = () => {
    if (previousValue === null || operation === null) return;

    const inputValue = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+': result = previousValue + inputValue; break;
      case '-': result = previousValue - inputValue; break;
      case '×': result = previousValue * inputValue; break;
      case '÷': result = previousValue / inputValue; break;
      default: result = inputValue;
    }

    setHistory([...history, `${previousValue} ${operation} ${inputValue} = ${result}`]);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const buttons = [
    ['C', '⌫', '±', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const getButtonClass = (btn: string) => {
    if (['÷', '×', '-', '+', '='].includes(btn)) {
      return 'bg-primary text-white hover:bg-sky-600';
    }
    if (['C', '⌫', '±', '%'].includes(btn)) {
      return 'bg-gray-800 text-gray-300 hover:bg-gray-700';
    }
    return 'bg-gray-700 text-gray-100 hover:bg-gray-600';
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleButtonClick = (btn: string) => {
    if (btn === 'C') clear();
    else if (btn === '⌫') backspace();
    else if (btn === '±') toggleSign();
    else if (btn === '%') percentage();
    else if (btn === '÷') performOperation('÷');
    else if (btn === '×') performOperation('×');
    else if (btn === '-') performOperation('-');
    else if (btn === '+') performOperation('+');
    else if (btn === '=') equals();
    else if (btn === '.') inputDecimal();
    else inputDigit(btn);
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-100 mb-3">General Calculator</h3>
      
      {/* Display */}
      <div className="bg-gray-900 text-white p-4 rounded-card mb-4 text-right">
        <div className="text-3xl font-mono overflow-x-auto">{display}</div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => handleButtonClick(btn)}
            className={`p-4 rounded-card font-semibold text-lg transition-smooth active:scale-95 min-h-touch ${getButtonClass(btn)}`}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">History</h4>
          <div className="bg-gray-800 rounded-card p-2 max-h-24 overflow-y-auto">
            {history.slice(-5).map((item, idx) => (
              <p key={idx} className="text-xs text-gray-400">{item}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Unit Converter Component
function UnitConverter() {
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
    <div>
      <h3 className="font-semibold text-gray-100 mb-3">Unit Converter</h3>

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
    </div>
  );
}

// Linear Interpolation Component
function LinearInterpolation() {
  const [x1, setX1] = useState('');
  const [y1, setY1] = useState('');
  const [x2, setX2] = useState('');
  const [y2, setY2] = useState('');
  const [targetX, setTargetX] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const x1Num = parseFloat(x1);
    const y1Num = parseFloat(y1);
    const x2Num = parseFloat(x2);
    const y2Num = parseFloat(y2);
    const targetXNum = parseFloat(targetX);

    if ([x1Num, y1Num, x2Num, y2Num, targetXNum].some(isNaN)) return;

    try {
      const res = linearInterpolation(x1Num, y1Num, x2Num, y2Num, targetXNum);
      setResult(res);
    } catch (e) {
      setResult(null);
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-100 mb-3">Linear Interpolation</h3>
      <p className="text-sm text-gray-400 mb-4">Find unknown Y value for a given X</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">X1</label>
            <input type="number" value={x1} onChange={(e) => setX1(e.target.value)} className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Y1</label>
            <input type="number" value={y1} onChange={(e) => setY1(e.target.value)} className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">X2</label>
            <input type="number" value={x2} onChange={(e) => setX2(e.target.value)} className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Y2</label>
            <input type="number" value={y2} onChange={(e) => setY2(e.target.value)} className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Target X</label>
          <input type="number" value={targetX} onChange={(e) => setTargetX(e.target.value)} className="w-full p-3 border border-gray-700 rounded-card input-3d text-gray-100" />
        </div>

        <div className="btn-wrapper w-full">
          <button onClick={calculate} className="btn w-full py-3">
            <span className="btn-letter">C</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">l</span>
            <span className="btn-letter">c</span>
            <span className="btn-letter">u</span>
            <span className="btn-letter">l</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">t</span>
            <span className="btn-letter">e</span>
          </button>
        </div>

        {result !== null && (
          <div className="bg-success/10 p-4 rounded-card text-center border border-success/20">
            <p className="text-sm text-gray-400">Result (Y):</p>
            <p className="text-xl font-semibold text-success">{result.toFixed(4)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Waterdraw Calculator Component - DISABLED
function WaterdrawCalculator() {
  return (
    <div>
      <h3 className="font-semibold text-gray-100 mb-3">Waterdraw Calculator</h3>
      
      <div className="bg-yellow-900/30 border border-yellow-700/50 p-6 rounded-card text-center">
        <p className="text-yellow-400 font-medium text-lg">⚠️ Calculator Disabled</p>
        <p className="text-sm text-yellow-500/80 mt-2">This calculator is temporarily unavailable for maintenance.</p>
      </div>
    </div>
  );
}

// API 1952 Calculator Component - DISABLED

function APICalculator() {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-3">API (CTL CPL) 1952</h3>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-card text-center">
        <p className="text-yellow-700 font-medium">⚠️ Calculator Disabled</p>
        <p className="text-sm text-yellow-600 mt-1">This calculator is temporarily unavailable for maintenance.</p>
      </div>
    </div>
  );
}
