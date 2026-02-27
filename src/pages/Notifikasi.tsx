import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { formatDate, formatTime } from '../utils/timeUtils';

export function Notifikasi() {
  const { notifications, acknowledgeNotification, userName, setUserName } = useAppStore();
  const [showNamePrompt, setShowNamePrompt] = useState(!userName);
  const [tempName, setTempName] = useState('');

  const handleSetName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setShowNamePrompt(false);
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Layout title="Notifikasi">
      {/* Name Prompt Modal for First-time Access */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-card p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-center mb-4 text-primary neon-text">Selamat Datang!</h2>
            <p className="text-gray-300 text-center mb-4">
              Silakan masukkan nama Anda untuk melanjutkan.
            </p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-3 rounded-input input-3d text-gray-100 placeholder-gray-500 focus:outline-none mb-4 min-h-touch"
              autoFocus
            />
            <button
              onClick={handleSetName}
              disabled={!tempName.trim()}
              className="w-full btn-3d text-primary py-3 rounded-card font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-touch"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📭</span>
            <p className="mt-4 text-gray-400">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotifications.map((notification) => {
              const isAcknowledged = userName && notification.acknowledgedBy?.includes(userName);

              
              return (
                <div
                  key={notification.id}
                  className={`card-3d rounded-card p-4 transition-3d ${
                    !isAcknowledged ? 'border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-100">{notification.title}</h3>
                      <p className="text-gray-300 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notification.createdAt)} • {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!isAcknowledged && (
                      <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full border border-primary/30">
                        Baru
                      </span>
                    )}
                  </div>
                  
                  {/* Acknowledge Button */}
                  {!isAcknowledged && userName && (
                    <button
                      onClick={async () => await acknowledgeNotification(notification.id, userName)}
                      className="mt-3 w-full btn-3d text-primary py-2 rounded-button text-sm font-medium min-h-touch"
                    >
                      ✓ Tandai Sudah Dibaca
                    </button>
                  )}

                  
                  {isAcknowledged && (
                    <p className="mt-2 text-xs text-success flex items-center gap-1">
                      <span className="w-2 h-2 bg-success rounded-full"></span>
                      Sudah dibaca
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
