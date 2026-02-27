import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatTime } from '../utils/timeUtils';

interface Toast {
  id: string;
  title: string;
  message: string;
  time: string;
}

export function NotificationAlert() {
  const { notifications, userName } = useAppStore();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevNotificationsRef = useRef<Set<string>>(new Set());

  // Detect new notifications
  useEffect(() => {
    const currentIds = new Set(notifications.map(n => n.id));
    
    // Find new notifications (not in previous set)
    const newNotifications = notifications.filter(n => !prevNotificationsRef.current.has(n.id));
    
    // Add toast for each new notification
    newNotifications.forEach(notification => {
      // Only show toast if user hasn't acknowledged it
      const isAcknowledged = userName && notification.acknowledgedBy?.includes(userName);
      
      if (!isAcknowledged) {
        const toast: Toast = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          time: formatTime(notification.createdAt),
        };
        
        setToasts(prev => [toast, ...prev].slice(0, 3)); // Max 3 toasts
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 5000);
      }
    });
    
    // Update previous notifications set
    prevNotificationsRef.current = currentIds;
  }, [notifications, userName]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass-panel rounded-card p-4 shadow-lg border-l-4 border-primary animate-slide-in"
          style={{
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔔</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-100 text-sm truncate">
                {toast.title}
              </h4>
              <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                {toast.message}
              </p>
              <p className="text-gray-500 text-xs mt-1">{toast.time}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-200 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
