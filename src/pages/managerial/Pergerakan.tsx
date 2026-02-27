import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatDate, formatTime } from '../../utils/timeUtils';
import type { Notification } from '../../types';

export function Pergerakan() {
  const { notifications, addNotification, deleteNotification, employees } = useAppStore();

  
  const [activeTab, setActiveTab] = useState<'pengumuman' | 'tersampaikan'>('pengumuman');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) return;

    const notification: Notification = {
      id: crypto.randomUUID(),
      title: title.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      acknowledgedBy: [],
    };

    await addNotification(notification);
    setTitle('');
    setMessage('');
    setShowForm(false);
  };


  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <div className="btn-wrapper flex-1">
          <button
            onClick={() => setActiveTab('pengumuman')}
            className={`btn w-full py-2 ${
              activeTab === 'pengumuman' ? 'border-primary' : ''
            }`}
          >
            <span className="btn-letter">P</span>
            <span className="btn-letter">e</span>
            <span className="btn-letter">n</span>
            <span className="btn-letter">g</span>
            <span className="btn-letter">u</span>
            <span className="btn-letter">m</span>
            <span className="btn-letter">u</span>
            <span className="btn-letter">m</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">n</span>
          </button>
        </div>
        <div className="btn-wrapper flex-1">
          <button
            onClick={() => setActiveTab('tersampaikan')}
            className={`btn w-full py-2 ${
              activeTab === 'tersampaikan' ? 'border-primary' : ''
            }`}
          >
            <span className="btn-letter">T</span>
            <span className="btn-letter">e</span>
            <span className="btn-letter">r</span>
            <span className="btn-letter">s</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">m</span>
            <span className="btn-letter">p</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">i</span>
            <span className="btn-letter">k</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">n</span>
          </button>
        </div>
      </div>

      {activeTab === 'pengumuman' ? (
        <div>
          {/* Create Announcement Button */}
          <div className="btn-wrapper w-full mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn w-full py-3"
            >
              <span className="btn-letter">
                {showForm ? 'Batal' : '+ Buat Pengumuman'}
              </span>
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="card-3d p-4 mb-4 space-y-4">
              <h3 className="font-semibold text-gray-100">Pengumuman Baru</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul pengumuman"
                  className="w-full px-4 py-3 border border-gray-700 rounded-card focus:outline-none focus:ring-2 focus:ring-primary min-h-touch input-3d text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pesan</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Isi pengumuman..."
                  className="w-full px-4 py-3 border border-gray-700 rounded-card focus:outline-none focus:ring-2 focus:ring-primary min-h-touch input-3d text-gray-100"
                  required
                />
              </div>

              <div className="btn-wrapper w-full">
                <button
                  type="submit"
                  className="btn w-full py-3"
                >
                  <span className="btn-letter">K</span>
                  <span className="btn-letter">i</span>
                  <span className="btn-letter">r</span>
                  <span className="btn-letter">i</span>
                  <span className="btn-letter">m</span>
                  <span className="btn-letter"> </span>
                  <span className="btn-letter">P</span>
                  <span className="btn-letter">e</span>
                  <span className="btn-letter">n</span>
                  <span className="btn-letter">g</span>
                  <span className="btn-letter">u</span>
                  <span className="btn-letter">m</span>
                  <span className="btn-letter">u</span>
                  <span className="btn-letter">m</span>
                  <span className="btn-letter">a</span>
                  <span className="btn-letter">n</span>
                </button>
              </div>
            </form>
          )}

          {/* Announcement List */}
          <div className="space-y-3">
            {sortedNotifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada pengumuman</p>
            ) : (
              sortedNotifications.map((notif) => (
                <div key={notif.id} className="card-3d p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-100">{notif.title}</h4>
                      <p className="text-gray-300 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notif.createdAt)} • {formatTime(notif.createdAt)}
                      </p>
                      <p className="text-xs text-primary mt-1">
                        Dibaca oleh {notif.acknowledgedBy?.length || 0} orang
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
                          await deleteNotification(notif.id);
                        }
                      }}
                      className="text-danger hover:text-red-400 ml-2"
                      title="Hapus pengumuman"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Tersampaikan - Read Receipts */
        <div className="space-y-3">
          {sortedNotifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada pengumuman</p>
          ) : (
            sortedNotifications.map((notif) => (
              <div key={notif.id} className="card-3d p-4">
                <h4 className="font-semibold text-gray-100">{notif.title}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {formatDate(notif.createdAt)}
                </p>
                
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-300">
                    Sudah Dibaca ({notif.acknowledgedBy?.length || 0}):
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {notif.acknowledgedBy && notif.acknowledgedBy.length > 0 ? (

                      notif.acknowledgedBy.map((name, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full border border-green-500/30"
                        >
                          ✓ {name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">Belum ada yang membaca</p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-300">
                    Belum Dibaca ({employees.length - (notif.acknowledgedBy?.length || 0)}):
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {employees
                      .filter((emp) => !(notif.acknowledgedBy || []).includes(emp.fullName))
                      .map((emp) => (

                        <span
                          key={emp.id}
                          className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-600/30"
                        >
                          {emp.fullName}
                        </span>
                      ))}
                    {employees.length === 0 && (
                      <p className="text-sm text-gray-400">Belum ada karyawan</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
