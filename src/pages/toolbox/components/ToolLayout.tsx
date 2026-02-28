import { ReactNode } from 'react';

interface ToolLayoutProps {
  title: string;
  children: ReactNode;
}

export function ToolLayout({ title, children }: ToolLayoutProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-100 mb-3">{title}</h3>
      {children}
    </div>
  );
}
