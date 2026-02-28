import type { ToolType } from '../types';


interface ToolCardProps {
  id: ToolType;
  name: string;
  icon: string;
  isActive: boolean;
  onClick: (id: ToolType) => void;
}

export function ToolCard({ id, name, icon, isActive, onClick }: ToolCardProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`p-4 rounded-card text-center transition-smooth card-3d ${
        isActive
          ? 'bg-primary text-white border-primary'
          : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 font-medium">{name}</p>
    </button>
  );
}
