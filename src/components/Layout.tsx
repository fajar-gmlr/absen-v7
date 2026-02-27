import React from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { path: '/absensi', label: 'Absensi', icon: '📝' },
  { path: '/notifikasi', label: 'Notifikasi', icon: '🔔' },
  { path: '/managerial', label: 'Managerial', icon: '⚙️' },
  { path: '/toolbox', label: 'Toolbox', icon: '🔧' },
  { path: '/notepad', label: 'Notepad', icon: '📒' },
];

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent relative z-10">
      {/* Header - Glassmorphism effect */}
      <header className="glass-panel px-4 py-3 sticky top-0 z-50 backdrop-blur-md bg-dark-surface/60">
        <h1 className="text-lg font-semibold text-center text-primary neon-text">{title}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel px-2 py-3 mx-4 mb-4 rounded-card z-50">
        <div className="flex justify-around items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'btn-wrapper' : 'btn-wrapper opacity-60 hover:opacity-100'
              }
            >
              <div className="btn py-2 px-3">
                <span className="text-lg mr-1">{item.icon}</span>
                <span className="btn-letter text-xs">{item.label}</span>
              </div>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
