import { useState, useCallback, memo } from 'react';
import { Layout } from '../components/Layout';
import { useAppStore, useEmployees } from '../store/useAppStore';
import { formatDate, formatTime } from '../utils/timeUtils';
import type { Notification } from '../types';

// ============================================
// MEMOIZED NOTIFICATION ITEM COMPONENT
// ============================================

interface NotificationItemProps {
  notification: Notification;
  isAcknowledged: boolean;
  userName: string | null;
  onAcknowledge: (notificationId: string, userName: string) => Promise<void>;
}

const NotificationItem = memo(function NotificationItem({ 
  notification, 
  isAcknowledged, 
  userName,
  onAcknowledge 
}: NotificationItemProps) {
  const handleAcknowledge = useCallback(() => {
    if (userName) {
      onAcknowledge(notification.id, userName);
    }
  }, [notification.id, userName, onAcknowledge]);

  return (
    <div
      className={`bg-black/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm transition-all ${
        !isAcknowledged ? 'border-l-4 border-l-green-500' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{notification.title}</h3>
          <p className="text-base text-white/60 mt-2">{notification.message}</p>
          <p className="text-sm text-white/40 mt-3">
            {formatDate(notification.createdAt)} • {formatTime(notification.createdAt)}
          </p>
        </div>
        {!isAcknowledged && (
          <span className="px-4 py-2 text-sm font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
            Baru
          </span>
        )}
      </div>
      
      {/* Acknowledge Button */}
      {!isAcknowledged && userName && (
        <button
          onClick={handleAcknowledge}
          className="mt-4 w-full py-3 border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 rounded-xl text-base font-medium hover:bg-cyan-500/20 transition-all"
        >
          ✓ Tandai Sudah Dibaca
        </button>
      )}

      {isAcknowledged && (
        <p className="mt-3 text-sm text-green-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Sudah dibaca
        </p>
      )}
    </div>
  );
});

// ============================================
// MAIN NOTIFIKASI COMPONENT
// ============================================

export function Notifikasi() {
  // Gunakan selector untuk karyawan dari store
  const employees = useEmployees();
  const { notifications, acknowledgeNotification, userName, setUserName } = useAppStore();
  
  const [showNamePrompt, setShowNamePrompt] = useState(!userName);
  const [selectedEmpName, setSelectedEmpName] = useState('');

  const handleSetName = useCallback(() => {
    if (selectedEmpName) {
      setUserName(selectedEmpName); // Menyimpan nama lengkap karyawan ke state user
      setShowNamePrompt(false);
    }
  }, [selectedEmpName, setUserName]);

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Layout title="Notifikasi">
      {/* Name Prompt Modal for First-time Access (Using Dropdown) */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 border border-white/10 p-8 rounded-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-5 text-cyan-400">Selamat Datang!</h2>
            <p className="text-base text-white/60 text-center mb-6">
              Silakan pilih nama Anda untuk melanjutkan.
            </p>
            
            <select
              value={selectedEmpName}
              onChange={(e) => setSelectedEmpName(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white focus:border-cyan-500 outline-none text-base mb-5"
            >
              <option value="" className="text-gray-900">Pilih Nama Anda...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.fullName} className="text-gray-900">
                  {emp.initial} - {emp.fullName}
                </option>
              ))}
              {employees.length === 0 && (
                <option value="" disabled className="text-gray-900">
                  Tidak ada karyawan terdaftar.
                </option>
              )}
            </select>

            <button
              onClick={handleSetName}
              disabled={!selectedEmpName}
              className="w-full py-4 border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 rounded-xl text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/20 transition-all"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Notifications List */}
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-7xl">📭</span>
            <p className="mt-5 text-lg text-white/40">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotifications.map((notification) => {
              const isAcknowledged = userName && notification.acknowledgedBy?.includes(userName);

              return (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isAcknowledged={!!isAcknowledged}
                  userName={userName}
                  onAcknowledge={acknowledgeNotification}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}