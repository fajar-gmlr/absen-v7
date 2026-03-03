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
      className={`p-4 rounded-card text-center transition-smooth holo-card ${
        isActive
          ? 'holo-active'
          : 'text-gray-300 hover:border-neon-teal/50'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 font-light">{name}</p>
    </button>
  );
}
