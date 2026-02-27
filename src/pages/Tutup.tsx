export function Tutup() {
  const handleExit = () => {
    // Show confirmation before exiting
    if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      // Close the browser tab/window
      window.close();
      
      // If window.close() doesn't work (browsers often block this),
      // redirect to a blank page or show a message
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #0EA5E9; color: white; font-family: sans-serif;">
          <div style="text-align: center;">
            <h1>👋 Terima Kasih</h1>
            <p>Aplikasi telah ditutup.</p>
            <p style="font-size: 0.8rem; margin-top: 20px;">Anda dapat menutup tab ini secara manual.</p>
          </div>
        </div>
      `;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="card-3d p-8 max-w-sm w-full text-center">
        <span className="text-6xl">👋</span>
        <h2 className="mt-4 text-2xl font-semibold text-gray-100">Tutup Aplikasi</h2>
        <p className="mt-2 text-gray-400">
          Klik tombol di bawah untuk keluar dari aplikasi.
        </p>
        
        <div className="btn-wrapper w-full mt-6">
          <button onClick={handleExit} className="btn w-full py-4 text-lg">
            <span className="btn-letter">🚪</span>
            <span className="btn-letter"> </span>
            <span className="btn-letter">T</span>
            <span className="btn-letter">u</span>
            <span className="btn-letter">t</span>
            <span className="btn-letter">u</span>
            <span className="btn-letter">p</span>
            <span className="btn-letter"> </span>
            <span className="btn-letter">A</span>
            <span className="btn-letter">p</span>
            <span className="btn-letter">l</span>
            <span className="btn-letter">i</span>
            <span className="btn-letter">k</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">s</span>
            <span className="btn-letter">i</span>
          </button>
        </div>
        
        <p className="mt-4 text-xs text-gray-500">
          Catatan: Beberapa browser mungkin memblokir penutupan otomatis. Anda dapat menutup tab ini secara manual.
        </p>
      </div>
    </div>
  );
}
