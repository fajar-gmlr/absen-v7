import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Header - Flat Holographic Panel */}
      <header className="holo-panel px-4 py-4 sticky top-0 z-50">
        <h1 className="text-xl font-semibold text-center text-white">{title}</h1>
      </header>

      {/* Main Content */}
      {/* pb-28 ditambahkan agar konten paling bawah tidak tertutup oleh floating BottomNav */}
      <main className="flex-1 overflow-y-auto pb-28 px-4 pt-4 relative z-10">
        {children}
      </main>
      
      {/* Catatan: Bagian <nav> lama di sini SUDAH DIHAPUS. 
        Navigasi sekarang dihandle sepenuhnya oleh BottomNav.tsx di dalam App.tsx 
      */}
    </div>
  );
}