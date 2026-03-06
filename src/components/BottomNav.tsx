import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserCheck, Bell, UserCog, Wrench, FileText } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Daftar menu sesuai urutan yang direquest, menggunakan UserCog untuk Managerial
  const navItems = [
    { path: '/absensi', icon: UserCheck, label: 'Absensi' },
    { path: '/notifikasi', icon: Bell, label: 'Notifikasi' },
    { path: '/managerial', icon: UserCog, label: 'Managerial' },
    { path: '/toolbox', icon: Wrench, label: 'Toolbox' },
    { path: '/notepad', icon: FileText, label: 'Catatan' },
  ];

  // Update indikator aktif berdasarkan URL saat ini
  useEffect(() => {
    // Menangani route '/' agar tetap mengarah ke index 0 (absensi)
    const currentPath = location.pathname === '/' ? '/absensi' : location.pathname;
    const index = navItems.findIndex(item => currentPath.startsWith(item.path));
    if (index !== -1) setActiveIndex(index);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pb-6 px-4 pointer-events-none">
      <div className="relative flex items-center bg-[#111111]/95 backdrop-blur-md border border-teal-500/30 w-full max-w-md h-16 rounded-2xl pointer-events-auto shadow-[0_8px_32px_rgba(20,184,166,0.15)]">
        
        {/* Lingkaran Indikator Aktif (Notch) */}
        <div 
          className="absolute top-[-22px] w-14 h-14 rounded-full border-[6px] border-[#0a0a0a] bg-gradient-to-tr from-teal-600 to-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.5)] transition-all duration-300 ease-in-out flex items-center justify-center z-10"
          style={{ 
            left: `calc(${(activeIndex * 20) + 10}% + ${(activeIndex * 0.5)}rem)`, 
            transform: 'translateX(-50%)' // Penyesuaian presisi posisi
          }}
        >
          {/* Ikon di dalam lingkaran aktif */}
          {navItems[activeIndex] && React.createElement(navItems[activeIndex].icon, { 
            className: "text-white w-6 h-6 animate-pulse" 
          })}
        </div>

        {/* Item Navigasi */}
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path}
              to={item.path} 
              className="relative flex-1 flex flex-col items-center justify-center h-full group cursor-pointer"
              onClick={() => setActiveIndex(index)}
            >
              <div className={`transition-all duration-300 ${isActive ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <Icon className="w-6 h-6 text-gray-500 group-hover:text-teal-400 transition-colors" />
              </div>

              {/* Tooltip Keterangan Page (Hover) */}
              <span className="absolute -top-12 bg-[#111] border border-teal-500/50 text-teal-400 text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-[0_0_15px_rgba(20,184,166,0.3)] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};