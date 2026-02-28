import { useState, useEffect } from 'react';
import { database } from '../../../firebase/config';
import { ref, onValue } from 'firebase/database';

interface ConnectionStatusBarProps {
  isConnected: boolean | null;
  lastSyncTime: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function ConnectionStatusBar({ 
  isConnected, 
  lastSyncTime, 
  isRefreshing, 
  onRefresh 
}: ConnectionStatusBarProps) {
  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-300">
          {isConnected === null ? 'Memeriksa koneksi...' : 
           isConnected ? 'Terhubung ke Firebase' : 'Tidak terhubung'}
        </span>
        {lastSyncTime && (
          <span className="text-xs text-gray-500">
            (Sync: {lastSyncTime.toLocaleTimeString('id-ID')})
          </span>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="text-sm px-3 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-smooth disabled:opacity-50"
      >
        {isRefreshing ? '⏳ Refresh...' : '🔄 Refresh'}
      </button>
    </div>
  );
}

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      setIsConnected(connected);
      if (connected) {
        setLastSyncTime(new Date());
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  return { isConnected, lastSyncTime, isRefreshing, handleRefresh };
}
