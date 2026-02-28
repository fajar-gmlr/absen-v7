import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';

const MANAGER_PIN = '7777';

export function Managerial() {
  const { isManagerMode, setManagerMode } = useAppStore();
  const navigate = useNavigate();
  
  const [pinInput, setPinInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(!isManagerMode);
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === MANAGER_PIN) {
      setManagerMode(true);
      setShowPinInput(false);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleExit = () => {
    setManagerMode(false);
    setShowPinInput(true);
    setPinInput('');
    navigate('/absensi');
  };

  // PIN Entry Screen
  if (showPinInput && !isManagerMode) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="card-3d p-6 max-w-sm w-full">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h2 className="mt-4 text-lg font-semibold text-gray-100">Managerial Area</h2>
            <p className="text-gray-500 text-sm">Masukkan PIN untuk mengakses</p>
          </div>
          
          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="Masukkan PIN"
              maxLength={4}
              className={`w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-card focus:outline-none focus:ring-2 mb-4 min-h-touch ${
                pinError ? 'border-danger focus:ring-danger input-3d' : 'border-gray-700 focus:ring-primary input-3d'
              }`}
              autoFocus
            />
            
            {pinError && (
              <p className="text-danger text-sm text-center mb-4">PIN yang Anda masukkan salah!</p>
            )}
            
            <div className="btn-wrapper w-full">
              <button type="submit" className="btn w-full py-3">
                <span className="btn-letter">M</span>
                <span className="btn-letter">a</span>
                <span className="btn-letter">s</span>
                <span className="btn-letter">u</span>
                <span className="btn-letter">k</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Managerial Content with Tabs
  return (
    <Layout title="Managerial">
      <div className="p-4">
        {/* Sub-navigation for Managerial sections */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 justify-center">
          <NavLink
            to="/managerial/karyawan"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-smooth ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            Karyawan
          </NavLink>
          <NavLink
            to="/managerial/kehadiran"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-smooth ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            Kehadiran
          </NavLink>
          <NavLink
            to="/managerial/pergerakan"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-smooth ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            Pergerakan
          </NavLink>
        </div>

        {/* Exit Button */}
        <div className="btn-wrapper w-full mb-4">
          <button onClick={handleExit} className="btn w-full py-3">
            <span className="btn-letter">🚪</span>
            <span className="btn-letter ml-1">K</span>
            <span className="btn-letter">e</span>
            <span className="btn-letter">l</span>
            <span className="btn-letter">u</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">r</span>
            <span className="btn-letter ml-1">d</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">r</span>
            <span className="btn-letter">i</span>
            <span className="btn-letter ml-1">M</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">n</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">g</span>
            <span className="btn-letter">e</span>
            <span className="btn-letter">r</span>
            <span className="btn-letter">i</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">l</span>
          </button>
        </div>

        {/* Nested Routes Render Here */}
        <Outlet />
      </div>
    </Layout>
  );
}
