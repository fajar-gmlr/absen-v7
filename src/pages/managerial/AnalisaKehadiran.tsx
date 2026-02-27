import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatTime, calculateBusinessDays, formatDate } from '../../utils/timeUtils';
import type { HealthCondition, Holiday } from '../../types';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';

type TabType = 'harian' | 'bulanan';

export function AnalisaKehadiran() {
  const { attendanceRecords, employees, holidays, addHoliday, deleteHoliday } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('harian');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // Connection status
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Holiday CRUD states
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayEndDate, setHolidayEndDate] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Monitor Firebase connection status
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

  // Manual refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force re-render by updating state
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  // Get today's records using local timezone (Indonesia/WIB)
  const now = new Date();
  const today = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
  
  // Debug logging
  console.log('[AnalisaKehadiran] Today date (local):', today);
  console.log('[AnalisaKehadiran] Total attendance records:', attendanceRecords.length);
  console.log('[AnalisaKehadiran] All records timestamps:', attendanceRecords.map(r => r.timestamp));
  
  const todayRecords = attendanceRecords.filter(r => {
    const recordDate = r.timestamp.split('T')[0];
    const isToday = recordDate === today;
    console.log(`[AnalisaKehadiran] Checking record ${r.employeeInitial}: ${recordDate} === ${today} ? ${isToday}`);
    return isToday;
  });
  
  console.log('[AnalisaKehadiran] Today records count:', todayRecords.length);
  console.log('[AnalisaKehadiran] Today records:', todayRecords.map(r => ({ name: r.employeeName, timestamp: r.timestamp })));
  
  // Get employees who have NOT submitted today
  const employeesWhoDidNotSubmit = employees.filter(
    emp => !todayRecords.some(r => r.employeeId === emp.id)
  );

  // Get health condition color
  const getHealthColor = (condition: HealthCondition): string => {
    switch (condition) {
      case 'healthy-no-symptoms': return 'bg-green-500';
      case 'has-symptoms-not-checked': return 'bg-orange-500';
      case 'sick-checked-medical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate monthly statistics
  const getMonthlyStats = () => {
    // Use selectedMonth and selectedYear instead of current date
    // This ensures calculations match the user's selected month/year
    const currentMonth = selectedMonth;
    const currentYear = selectedYear;
    
    return employees.map(emp => {
      const empRecords = attendanceRecords.filter(r => {
        const recordDate = new Date(r.timestamp);
        return r.employeeId === emp.id &&
          recordDate.getMonth() === currentMonth &&
          recordDate.getFullYear() === currentYear;
      });

      const lateCount = empRecords.filter(r => r.status === 'late').length;
      
      // Convert holidays to format expected by calculateBusinessDays
      const holidayDates = holidays.map(h => ({
        date: h.date,
        endDate: h.endDate
      }));
      
      // Calculate total business days in the month (excluding weekends and holidays)
      const totalBusinessDays = calculateBusinessDays(
        new Date(currentYear, currentMonth, 1),
        new Date(currentYear, currentMonth + 1, 0),
        holidayDates
      );

      // Absen = days the employee actually submitted attendance
      const absenCount = empRecords.length;
      
      // Tidak Absen = business days minus days they submitted attendance
      const tidakAbsenCount = totalBusinessDays - absenCount;

      return {
        employee: emp,
        lateCount,
        absenCount,        // Days submitted
        tidakAbsenCount,   // Days missed
        totalBusinessDays, // Total working days in month
      };
    });
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div>
      {/* Connection Status Bar */}
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
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-sm px-3 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-smooth disabled:opacity-50"
        >
          {isRefreshing ? '⏳ Refresh...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Data Summary */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="bg-gray-800 p-2 rounded text-center">
          <p className="text-xs text-gray-500">Karyawan</p>
          <p className="text-lg font-bold text-primary">{employees.length}</p>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <p className="text-xs text-gray-500">Absen Hari Ini</p>
          <p className="text-lg font-bold text-green-400">{todayRecords.length}</p>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <p className="text-xs text-gray-500">Total Records</p>
          <p className="text-lg font-bold text-blue-400">{attendanceRecords.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <div className="btn-wrapper flex-1">
          <button
            onClick={() => setActiveTab('harian')}
            className={`btn w-full py-2 ${
              activeTab === 'harian' ? 'border-primary' : ''
            }`}
          >
            <span className="btn-letter">H</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">r</span>
            <span className="btn-letter">i</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">n</span>
          </button>
        </div>
        <div className="btn-wrapper flex-1">
          <button
            onClick={() => setActiveTab('bulanan')}
            className={`btn w-full py-2 ${
              activeTab === 'bulanan' ? 'border-primary' : ''
            }`}
          >
            <span className="btn-letter">B</span>
            <span className="btn-letter">u</span>
            <span className="btn-letter">l</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">n</span>
            <span className="btn-letter">a</span>
            <span className="btn-letter">n</span>
          </button>
        </div>
      </div>

      {activeTab === 'harian' ? (
        <div className="space-y-6">
          {/* Employees who submitted */}
          <div>
            <h3 className="font-semibold text-gray-100 mb-3">
              ✅ Sudah Absen ({todayRecords.length})
            </h3>
            <div className="space-y-2">
              {todayRecords.map((record) => (
                <div key={record.id}>
                  <button
                    onClick={() => setExpandedCard(expandedCard === record.id ? null : record.id)}
                    className={`w-full card-3d p-3 text-left transition-smooth ${
                      record.status === 'late' ? 'border-l-4 border-late' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full animate-pulse-slow ${getHealthColor(record.healthCondition)}`} />
                        <span className="font-medium text-gray-100">
                          {record.employeeInitial} - {record.employeeName}
                        </span>
                        {record.status === 'late' && (
                          <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">
                            Telat
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400">
                        {expandedCard === record.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>
                  
                  {expandedCard === record.id && (
                    <div className="card-3d p-3 mt-1 card-expanded">
                      <p className="text-sm text-gray-300">
                        <strong className="text-gray-100">Lokasi:</strong> {record.workLocation}
                        {record.customWorkLocation && ` (${record.customWorkLocation})`}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-gray-100">Kemarin:</strong> {record.yesterdayWork}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-gray-100">Hari ini:</strong> {record.todayWork}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-gray-100">Besok:</strong> {record.tomorrowAgenda}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Absen: {formatTime(record.timestamp)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {todayRecords.length === 0 && (
                <p className="text-gray-500 text-center py-4">Belum ada yang absen hari ini</p>
              )}
            </div>
          </div>

          {/* Employees who did NOT submit */}
          <div>
            <h3 className="font-semibold text-gray-100 mb-3">
              ❌ Belum Absen ({employeesWhoDidNotSubmit.length})
            </h3>
            <div className="space-y-2">
              {employeesWhoDidNotSubmit.map((emp) => (
                <div
                  key={emp.id}
                  className="card-3d p-3 bg-red-900/20 border border-red-500/30"
                >
                  <span className="font-medium text-red-400">
                    {emp.initial} - {emp.fullName}
                  </span>
                </div>
              ))}
              {employeesWhoDidNotSubmit.length === 0 && employees.length > 0 && (
                <p className="text-success text-center py-4">Semua sudah absen! 🎉</p>
              )}
              {employees.length === 0 && (
                <p className="text-gray-500 text-center py-4">Belum ada karyawan terdaftar</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Monthly View */
        <div className="space-y-4">
          {/* Month/Year Selector and Export */}
          <div className="card-3d p-4">
            <div className="flex gap-2 mb-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="flex-1 p-2 border border-gray-700 rounded-card text-sm input-3d text-gray-100"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i} className="text-gray-900">
                    {new Date(2024, i).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="flex-1 p-2 border border-gray-700 rounded-card text-sm input-3d text-gray-100"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year} className="text-gray-900">{year}</option>
                ))}
              </select>
            </div>
            
            <div className="btn-wrapper w-full">
              <button
                onClick={exportToExcel}
                className="btn w-full py-2 text-sm"
              >
                <span className="btn-letter">📊</span>
                <span className="btn-letter"> </span>
                <span className="btn-letter">E</span>
                <span className="btn-letter">x</span>
                <span className="btn-letter">p</span>
                <span className="btn-letter">o</span>
                <span className="btn-letter">r</span>
                <span className="btn-letter">t</span>
                <span className="btn-letter"> </span>
                <span className="btn-letter">k</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter"> </span>
                <span className="btn-letter">E</span>
                <span className="btn-letter">x</span>
                <span className="btn-letter">c</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">l</span>
              </button>
            </div>
          </div>

          {/* Holiday Management */}
          <div className="card-3d p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-100">📅 Hari Libur</h3>
              <div className="btn-wrapper">
                <button
                  onClick={() => setShowHolidayForm(!showHolidayForm)}
                  className="btn text-sm px-3 py-1"
                >
                  <span className="btn-letter">
                    {showHolidayForm ? 'Batal' : '+ Tambah'}
                  </span>
                </button>
              </div>
            </div>
            
            {showHolidayForm && (
              <form onSubmit={handleAddHoliday} className="space-y-2 mb-3">
                {/* Multi-day toggle */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="multiDay"
                    checked={isMultiDay}
                    onChange={(e) => {
                      setIsMultiDay(e.target.checked);
                      if (!e.target.checked) {
                        setHolidayEndDate('');
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600"
                  />
                  <label htmlFor="multiDay" className="text-sm text-gray-300">
                    Libur beberapa hari
                  </label>
                </div>

                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-card text-sm input-3d text-gray-100"
                  required
                />
                
                {isMultiDay && (
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Sampai tanggal:</label>
                    <input
                      type="date"
                      value={holidayEndDate}
                      onChange={(e) => setHolidayEndDate(e.target.value)}
                      min={holidayDate}
                      className="w-full p-2 border border-gray-700 rounded-card text-sm input-3d text-gray-100"
                      required={isMultiDay}
                    />
                  </div>
                )}
                
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="Nama hari libur"
                  className="w-full p-2 border border-gray-700 rounded-card text-sm input-3d text-gray-100"
                  required
                />
                <div className="btn-wrapper w-full">
                  <button
                    type="submit"
                    className="btn w-full py-2 text-sm"
                  >
                    <span className="btn-letter">S</span>
                    <span className="btn-letter">i</span>
                    <span className="btn-letter">m</span>
                    <span className="btn-letter">p</span>
                    <span className="btn-letter">a</span>
                    <span className="btn-letter">n</span>
                  </button>
                </div>
              </form>
            )}
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {holidays.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">Belum ada hari libur</p>
              ) : (
                holidays.map((holiday) => (
                  <div key={holiday.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-100">{holiday.name}</p>
                      <p className="text-xs text-gray-500">
                        {holiday.isMultiDay && holiday.endDate 
                          ? `${formatDate(holiday.date)} - ${formatDate(holiday.endDate)}`
                          : formatDate(holiday.date)
                        }
                        {holiday.isMultiDay && <span className="ml-1 text-primary">({getHolidayDuration(holiday)} hari)</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteHoliday(holiday.id)}
                      className="text-danger text-xs px-2 py-1 hover:bg-red-900/30 rounded transition-smooth"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="space-y-3">
            {monthlyStats.map((stat) => (
              <div key={stat.employee.id} className="card-3d p-4">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <h4 className="font-semibold text-gray-100">
                      {stat.employee.initial} - {stat.employee.fullName}
                    </h4>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-green-900/30 p-2 rounded text-center">
                        <p className="text-xs text-green-400">Absen</p>
                        <p className="text-lg font-bold text-green-400">{stat.absenCount}</p>
                        <p className="text-xs text-gray-500">hari</p>
                      </div>
                      <div className="bg-red-900/30 p-2 rounded text-center">
                        <p className="text-xs text-red-400">Tidak Absen</p>
                        <p className="text-lg font-bold text-red-400">{stat.tidakAbsenCount}</p>
                        <p className="text-xs text-gray-500">hari</p>
                      </div>
                      <div className="bg-purple-900/30 p-2 rounded text-center">
                        <p className="text-xs text-purple-400">Telat</p>
                        <p className="text-lg font-bold text-purple-400">{stat.lateCount}</p>
                        <p className="text-xs text-gray-500">hari</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Total hari kerja: {stat.totalBusinessDays} hari (tidak termasuk libur)
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <p className="text-gray-500 text-center py-8">Belum ada karyawan terdaftar</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function getHolidayDuration(holiday: Holiday): number {
    if (!holiday.endDate) return 1;
    const start = new Date(holiday.date);
    const end = new Date(holiday.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  function handleAddHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!holidayDate || !holidayName) return;
    
    // Validate multi-day holiday
    if (isMultiDay && !holidayEndDate) {
      alert('Silakan pilih tanggal akhir untuk libur beberapa hari');
      return;
    }
    
    const newHoliday: Holiday = {
      id: Date.now().toString(),
      date: holidayDate,
      endDate: isMultiDay ? holidayEndDate : undefined,
      name: holidayName,
      isCustom: true,
      isMultiDay: isMultiDay,
    };
    
    addHoliday(newHoliday);
    setHolidayDate('');
    setHolidayEndDate('');
    setHolidayName('');
    setIsMultiDay(false);
    setShowHolidayForm(false);
  }

  function exportToExcel() {
    // Create CSV content
    const headers = ['Inisial', 'Nama Lengkap', 'Absen (hari)', 'Tidak Absen (hari)', 'Telat (hari)', 'Total Hari Kerja'];
    const rows = monthlyStats.map(stat => [
      stat.employee.initial,
      stat.employee.fullName,
      stat.absenCount,
      stat.tidakAbsenCount,
      stat.lateCount,
      stat.totalBusinessDays
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `kehadiran-${selectedMonth + 1}-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
