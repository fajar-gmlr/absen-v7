import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

export function GeneralCalculator() {
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
    <ToolLayout title="General Calculator">
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
    </ToolLayout>
  );
}
