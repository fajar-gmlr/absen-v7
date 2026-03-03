import React from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export function Layout({ children, title }: LayoutProps) {
  // Build nav items - Managerial always visible (protected by PIN 7777)
  const navItems = [
    { path: '/absensi', label: 'Absensi' },
    { path: '/notifikasi', label: 'Notifikasi' },
    { path: '/managerial', label: 'Managerial' },
    { path: '/toolbox', label: 'Toolbox' },
    { path: '/notepad', label: 'Catatan' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Header - Flat Holographic Panel */}
      <header className="holo-panel px-4 py-4 sticky top-0 z-50">
        <h1 className="text-xl font-semibold text-center text-white">{title}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-28 px-4 pt-4 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation - Flat Holographic Panel */}
      <nav className="fixed bottom-0 left-0 right-0 holo-panel px-3 py-4 mx-3 mb-3 rounded-2xl z-50">
        <div className="flex justify-around items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'flex-1' : 'flex-1 opacity-70 hover:opacity-100'
              }
            >
              <div className="py-3 px-2 text-center">
                <span className="text-sm font-semibold whitespace-nowrap text-white">{item.label}</span>
              </div>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
