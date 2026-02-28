import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatTime, formatDate } from '../utils/timeUtils';

interface Toast {
  id: string;
  title: string;
  message: string;
  time: string;
}

interface FullScreenNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export function NotificationAlert() {
  const { notifications, userName, acknowledgeNotification } = useAppStore();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fullScreenNotifs, setFullScreenNotifs] = useState<FullScreenNotification[]>([]);
  const [currentNotifIndex, setCurrentNotifIndex] = useState(0);
  const prevNotificationsRef = useRef<Set<string>>(new Set());
  const hasShownFullScreen = useRef(false);

  // Check for unacknowledged notifications (full screen) - runs continuously until acknowledged
  useEffect(() => {
    if (!userName) return;
    
    // Get all unacknowledged notifications
    const unacknowledged = notifications
      .filter(n => !n.acknowledgedBy?.includes(userName))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (unacknowledged.length > 0 && !hasShownFullScreen.current) {
      // Show all unacknowledged notifications
      setFullScreenNotifs(unacknowledged.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
      })));
      hasShownFullScreen.current = true;
    }
  }, [notifications, userName]);

  // Detect new notifications (toast)
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

  const handleAcknowledgeFullScreen = async () => {
    const currentNotif = fullScreenNotifs[currentNotifIndex];
    if (currentNotif && userName) {
      await acknowledgeNotification(currentNotif.id, userName);
      
      // Move to next notification or close if all acknowledged
      if (currentNotifIndex < fullScreenNotifs.length - 1) {
        setCurrentNotifIndex(prev => prev + 1);
      } else {
        // All notifications acknowledged - close the modal
        setFullScreenNotifs([]);
        setCurrentNotifIndex(0);
      }
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {/* Full Screen Notification Modal */}
      {fullScreenNotifs.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="glass-panel rounded-card p-8 max-w-2xl w-full mx-4 border-2 border-primary shadow-2xl animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-6 animate-bounce">🔔</div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Pengumuman Penting</h2>
              
              {/* Progress indicator */}
              {fullScreenNotifs.length > 1 && (
                <p className="text-sm text-primary mb-4">
                  {currentNotifIndex + 1} dari {fullScreenNotifs.length} pengumuman
                </p>
              )}
              
              <p className="text-sm text-gray-400 mb-6">
                {formatDate(fullScreenNotifs[currentNotifIndex].createdAt)} • {formatTime(fullScreenNotifs[currentNotifIndex].createdAt)}
              </p>
              
              <div className="bg-gray-800/50 rounded-card p-6 mb-6 text-left max-h-[50vh] overflow-y-auto">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {fullScreenNotifs[currentNotifIndex].title}
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                  {fullScreenNotifs[currentNotifIndex].message}
                </p>
              </div>
              
              {/* List of all pending notifications */}
              {fullScreenNotifs.length > 1 && (
                <div className="mb-6 text-left">
                  <p className="text-sm text-gray-400 mb-2">Pengumuman lain yang menunggu:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {fullScreenNotifs.map((notif, idx) => (
                      <div 
                        key={notif.id}
                        className={`p-2 rounded text-sm ${
                          idx === currentNotifIndex 
                            ? 'bg-primary/20 border border-primary' 
                            : idx < currentNotifIndex 
                              ? 'bg-success/20 text-gray-500' 
                              : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {idx < currentNotifIndex ? '✓ ' : ''}{notif.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="btn-wrapper">
                <button 
                  onClick={handleAcknowledgeFullScreen}
                  className="btn w-full py-4 text-lg"
                >
                  <span className="btn-letter">S</span>
                  <span className="btn-letter">a</span>
                  <span className="btn-letter">y</span>
                  <span className="btn-letter">a</span>
                  <span className="btn-letter"> </span>
                  <span className="btn-letter">S</span>
                  <span className="btn-letter">u</span>
                  <span className="btn-letter">d</span>
                  <span className="btn-letter">a</span>
                  <span className="btn-letter">h</span>
                  <span className="btn-letter"> </span>
                  <span className="btn-letter">M</span>
                  <span className="btn-letter">e</span>
                  <span className="btn-letter">m</span>
                  <span className="btn-letter">b</span>
                  <span className="btn-letter">a</span>
                  <span className="btn-letter">c</span>
                  <span className="btn-letter">a</span>
                </button>
              </div>
            </div>
          </div>
          
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in {
              animation: fadeIn 0.3s ease-out;
            }
          `}</style>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
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
      )}
    </>
  );
}
