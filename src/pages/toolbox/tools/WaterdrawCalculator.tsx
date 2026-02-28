import { ToolLayout } from '../components/ToolLayout';

export function WaterdrawCalculator() {
  return (
    <ToolLayout title="Waterdraw Calculator">
      <div className="bg-yellow-900/30 border border-yellow-700/50 p-6 rounded-card text-center">
        <p className="text-yellow-400 font-medium text-lg">⚠️ Calculator Disabled</p>
        <p className="text-sm text-yellow-500/80 mt-2">This calculator is temporarily unavailable for maintenance.</p>
      </div>
    </ToolLayout>
  );
}
