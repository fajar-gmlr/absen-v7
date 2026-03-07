import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { ToolCard } from './components/ToolCard';
import { GeneralCalculator } from './tools/GeneralCalculator';
import { UnitConverter } from './tools/UnitConverter';
import { LinearInterpolation } from './tools/LinearInterpolation';
import { WaterdrawCalculator } from './tools/WaterdrawCalculator';
import { APICalculator } from './tools/APICalculator';
import { RTDCalculator } from './tools/RTDCalculator'; // <-- Import komponen RTD baru
import type { ToolType, ToolDefinition } from './types';

export { ToolType, ToolDefinition };

const tools: ToolDefinition[] = [
  { id: 'calculator', name: 'Calculator', icon: '🧮' },
  { id: 'converter', name: 'Unit Converter', icon: '🔄' },
  { id: 'interpolation', name: 'Linear Interpolation', icon: '📈' },
  { id: 'waterdraw', name: 'Waterdraw', icon: '💧' },
  { id: 'api1952', name: 'API (CTL & CPL)', icon: '🛢️' },
  { id: 'rtd', name: 'RTD PT-100', icon: '🌡️' }, // <-- Tambahkan kartu RTD PT-100 di sini
];

export function Toolbox() {
  const [activeTool, setActiveTool] = useState<ToolType>('calculator');

  const renderTool = () => {
    switch (activeTool) {
      case 'calculator':
        return <GeneralCalculator />;
      case 'converter':
        return <UnitConverter />;
      case 'interpolation':
        return <LinearInterpolation />;
      case 'waterdraw':
        return <WaterdrawCalculator />;
      case 'api1952':
        return <APICalculator />;
      case 'rtd':
        return <RTDCalculator />; // <-- Tambahkan routing ke komponen RTD
      default:
        return <GeneralCalculator />;
    }
  };

  return (
    <Layout title="Toolbox">
      <div className="p-4">
        {/* Tool Selection Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              icon={tool.icon}
              isActive={activeTool === tool.id}
              onClick={setActiveTool}
            />
          ))}
        </div>

        {/* Tool Content */}
        <div className="holo-card p-4">
          {renderTool()}
        </div>
      </div>
    </Layout>
  );
}