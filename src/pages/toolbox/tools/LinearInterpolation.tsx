import { useState } from 'react';
import { linearInterpolation } from '../../../utils/toolboxCalculations';
import { ToolLayout } from '../components/ToolLayout';

export function LinearInterpolation() {
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
    <ToolLayout title="Linear Interpolation">
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
    </ToolLayout>
  );
}
