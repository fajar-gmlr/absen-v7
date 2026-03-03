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
          onClick={handleAcknowledge}
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
});

// ============================================
// MEMOIZED EMPLOYEE SELECT COMPONENT
// ============================================

interface EmployeeSelectProps {
  employees: { id: string; initial: string; fullName: string }[];
  selectedEmployee: string;
  onChange: (employeeId: string) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const EmployeeSelectForm = memo(function EmployeeSelectForm({
  employees,
  selectedEmployee,
  onChange,
  isSubmitting,
  onCancel
}: EmployeeSelectProps) {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // The parent component will handle the actual submission
  }, []);

  return (
    <div className="card-3d rounded-card p-4 mb-4">
      <h3 className="font-semibold text-gray-100 mb-4">Kirim Notifikasi ke Karyawan</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Employee Selection Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pilih Karyawan <span className="text-danger">*</span>
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-input input-3d text-gray-100 focus:outline-none min-h-touch"
            disabled={isSubmitting}
          >
            <option value="" className="text-gray-900">Pilih Karyawan...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id} className="text-gray-900">
                {emp.initial} - {emp.fullName}
              </option>
            ))}
            {employees.length === 0 && (
              <option value="" disabled className="text-gray-900">
                Tidak ada karyawan. Hubungi manager.
              </option>
            )}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 btn-3d text-gray-300 py-3 rounded-card font-semibold disabled:opacity-50 min-h-touch"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
});

// ============================================
// MAIN NOTIFIKASI COMPONENT
// ============================================

export function Notifikasi() {
  // Use optimized selector to prevent re-renders from unrelated store data
  const employees = useEmployees();
  const { notifications, acknowledgeNotification, userName, setUserName, addNotification } = useAppStore();
  
  const [showNamePrompt, setShowNamePrompt] = useState(!userName);
  const [tempName, setTempName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetName = useCallback(() => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setShowNamePrompt(false);
    }
  }, [tempName, setUserName]);

  const handleEmployeeSelect = useCallback(async (employeeId: string) => {
    setSelectedEmployee(employeeId);
    
    if (!employeeId) return;
    
    // Find the employee
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    setIsSubmitting(true);
    try {
      // Create notification for selected employee
      const notification: Notification = {
        id: crypto.randomUUID(),
        title: `Notifikasi untuk ${employee.initial} - ${employee.fullName}`,
        message: `Halo ${employee.fullName}, Anda memiliki notifikasi baru. Silakan hubungi manager untuk informasi lebih lanjut.`,
        createdAt: new Date().toISOString(),
        acknowledgedBy: [],
      };
      await addNotification(notification);
      
      // Reset form
      setSelectedEmployee('');
      setShowForm(false);
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [employees, addNotification]);

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
        {/* Toggle Form Button */}
        {!showNamePrompt && (
          <div className="btn-wrapper w-full mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn w-full py-3"
            >
              <span className="btn-letter">
                {showForm ? 'Batal' : '+ Kirim Notifikasi'}
              </span>
            </button>
          </div>
        )}

        {/* Employee Selection Form - Just Dropdown */}
        {showForm && !showNamePrompt && (
          <EmployeeSelectForm
            employees={employees}
            selectedEmployee={selectedEmployee}
            onChange={handleEmployeeSelect}
            isSubmitting={isSubmitting}
            onCancel={() => {
              setShowForm(false);
              setSelectedEmployee('');
            }}
          />
        )}

        {/* Notifications List */}
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

