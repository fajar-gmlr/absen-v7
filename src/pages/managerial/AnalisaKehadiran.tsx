import { useState, useMemo, useTransition, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Holiday, Employee, AttendanceRecord, HealthCondition } from '../../types';
import { ConnectionStatusBar, useConnectionStatus } from './components/ConnectionStatusBar';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';
import { DatabaseFixer } from './components/DatabaseFixer';

// ============================================
// TYPES & UTILS
// ============================================
type TabType = 'harian' | 'bulanan';

interface DailyStats {
  date: string;
  status: 'ontime' | 'late' | 'absent' | 'weekend' | 'holiday' | 'working';
}

interface MonthlyStats {
  employee: Employee;
  ontimeCount: number;
  lateCount: number;
  absentCount: number;
  totalBusinessDays: number;
  attendanceRate: number;
  dailyStats: DailyStats[];
}

// BUGFIX: Perbaikan logika On Time dan Late
const getAttendanceStatus = (timestamp: string): 'ontime' | 'late' | 'invalid' => {
  const date = new Date(timestamp);
  // Ubah ke format total menit agar perhitungan presisi tanpa pusing timezone tambahan
  const totalMinutes = date.getHours() * 60 + date.getMinutes();

  if (totalMinutes < 5 * 60) return 'invalid'; // Sebelum jam 05:00
  if (totalMinutes < 10 * 60) return 'ontime'; // Antara 05:00 sampai 09:59
  return 'late'; // Jam 10:00 ke atas pasti Late (termasuk jam 22:00)
};

// Helper to get current time strictly in WIB (UTC+7) avoiding device timezone issues
const getCurrentTimeWIB = (): number => {
  const now = new Date();
  let wibHour = now.getUTCHours() + 7;
  if (wibHour >= 24) wibHour -= 24;
  return wibHour + now.getUTCMinutes() / 60;
};

// Check if current time is past 17:00 WIB
const isPast17WIB = (): boolean => {
  const currentTimeWIB = getCurrentTimeWIB();
  return currentTimeWIB >= 17;
};

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// ============================================
// MAIN COMPONENT: AnalisaKehadiran
// ============================================
export function AnalisaKehadiran() {
  const { attendanceRecords, employees, holidays, addHoliday, deleteHoliday } = useAppStore();
  
  // Transitions & Tabs
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>('harian');
  
  // Filter States
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dailyDate, setDailyDate] = useState<string>(formatDateKey(new Date()));
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Holiday Manager States
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayEndDate, setHolidayEndDate] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [holidayName, setHolidayName] = useState('');

  // Status Koneksi
  const { isConnected, lastSyncTime, isRefreshing, handleRefresh } = useConnectionStatus();

  // ============================================
  // ANALYTICS ENGINE (useMemo Optimized)
  // ============================================

  // 1. Expand Holiday Dates
  const expandedHolidayDates = useMemo(() => {
    const dates = new Set<string>();
    holidays.forEach(h => {
      const start = new Date(h.date);
      const end = h.endDate ? new Date(h.endDate) : start;
      const curr = new Date(start);
      while (curr <= end) {
        dates.add(formatDateKey(curr));
        curr.setDate(curr.getDate() + 1);
      }
    });
    return dates;
  }, [holidays]);

  // 2. Map Records by Employee
  const monthlyRecordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>();
    attendanceRecords.forEach(r => {
      const d = new Date(r.timestamp);
      if (d.getMonth() === selectedMonth && d.getFullYear() === selectedYear) {
        const existing = map.get(r.employeeId) || [];
        existing.push(r);
        map.set(r.employeeId, existing);
      }
    });
    return map;
  }, [attendanceRecords, selectedMonth, selectedYear]);

  // BUGFIX: DEDUPLIKASI HARIAN (Mencegah nama muncul dua kali)
  const uniqueTodayRecords = useMemo(() => {
    const recordsForDate = attendanceRecords.filter(r => formatDateKey(new Date(r.timestamp)) === dailyDate);
    
    // Sort dari yang paling pagi ke paling malam
    const sorted = [...recordsForDate].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Masukkan ke Map untuk memastikan 1 ID hanya punya 1 data absen (diambil yang paling pagi)
    const unique = new Map<string, AttendanceRecord>();
    for (const record of sorted) {
      if (!unique.has(record.employeeId)) {
        unique.set(record.employeeId, record);
      }
    }
    return Array.from(unique.values());
  }, [attendanceRecords, dailyDate]);

  // Siapa yang belum absen hari ini
  const employeesWhoDidNotSubmitToday = useMemo(() => {
    return employees.filter(e => !uniqueTodayRecords.some(r => r.employeeId === e.id));
  }, [employees, uniqueTodayRecords]);


  // 3. Core Matrix Calculation
  const monthlyStats = useMemo((): MonthlyStats[] => {
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayKey = formatDateKey(today);
    const past17WIBToday = isPast17WIB();

    return employees.map(emp => {
      const empRecords = monthlyRecordsMap.get(emp.id) || [];
      
      // BUGFIX: Deduplikasi bulanan (Jika 1 hari absen 2x, simpan status yang paling pagi)
      const sortedEmpRecords = [...empRecords].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const recordDates = new Map<string, AttendanceRecord>();
      sortedEmpRecords.forEach(r => {
        const dateKey = formatDateKey(new Date(r.timestamp));
        if (!recordDates.has(dateKey)) {
          recordDates.set(dateKey, r);
        }
      });
      
      const dailyStats: DailyStats[] = [];
      let ontime = 0, late = 0, absent = 0, bizDays = 0;

      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const d = new Date(selectedYear, selectedMonth, i);
        const dKey = formatDateKey(d);
        const isPast = d < today;
        const isToday = dKey === todayKey;

        let status: DailyStats['status'] = 'working';
        
        if (isWeekend(d)) {
          status = 'weekend';
        } else if (expandedHolidayDates.has(dKey)) {
          status = 'holiday';
        } else {
          bizDays++;
          const record = recordDates.get(dKey);
          if (record) {
            const recordTime = new Date(record.timestamp);
            const recordHour = recordTime.getHours();
            if (recordHour >= 17) {
              status = 'absent';
              absent++;
            } else {
              status = getAttendanceStatus(record.timestamp) === 'late' ? 'late' : 'ontime';
              if (status === 'late') late++; else ontime++;
            }
          } else if (isPast) {
            status = 'absent';
            absent++;
          } else if (isToday && past17WIBToday) {
            status = 'absent';
            absent++;
          }
        }
        dailyStats.push({ date: dKey, status });
      }

      return {
        employee: emp,
        ontimeCount: ontime,
        lateCount: late,
        absentCount: absent,
        totalBusinessDays: bizDays,
        attendanceRate: bizDays > 0 ? Math.round(((ontime + late) / bizDays) * 100) : 0,
        dailyStats
      };
    });
  }, [employees, monthlyRecordsMap, expandedHolidayDates, selectedMonth, selectedYear]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleTabChange = useCallback((tab: TabType) => {
    startTransition(() => setActiveTab(tab));
  }, []);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayName) return;

    const newHoliday: Holiday = {
      id: Date.now().toString(),
      date: holidayDate,
      name: holidayName,
      isCustom: true,
      isMultiDay,
      ...(isMultiDay && { endDate: holidayEndDate })
    };

    try {
      await addHoliday(newHoliday);
      setHolidayName(''); setHolidayDate(''); setHolidayEndDate('');
      setShowHolidayForm(false);
    } catch (err) {
      console.error("Gagal tambah libur:", err);
    }
  };

  const handleExportExcel = useCallback(() => {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const currentMonth = monthNames[selectedMonth];
    let tableRows = '';
    monthlyStats.forEach((stat, index) => {
      const colorClass = stat.attendanceRate >= 80 ? 'green' : stat.attendanceRate >= 50 ? 'yellow' : 'red';
      tableRows += '<tr><td>' + (index + 1) + '</td><td>' + stat.employee.fullName + '</td><td class="' + colorClass + '">' + stat.attendanceRate + '%</td><td>' + stat.ontimeCount + '</td><td>' + stat.lateCount + '</td><td>' + stat.absentCount + '</td><td>' + stat.totalBusinessDays + '</td></tr>';
    });
    const totalOntime = monthlyStats.reduce((a, b) => a + b.ontimeCount, 0);
    const totalLate = monthlyStats.reduce((a, b) => a + b.lateCount, 0);
    const totalAbsent = monthlyStats.reduce((a, b) => a + b.absentCount, 0);
    const totalDays = monthlyStats.reduce((a, b) => a + b.totalBusinessDays, 0);
    const avgRate = monthlyStats.length > 0 ? Math.round(monthlyStats.reduce((a, b) => a + b.attendanceRate, 0) / monthlyStats.length) : 0;
    tableRows += '<tr style="font-weight:bold;background:#e2e8f0"><td colspan="2">TOTAL</td><td>' + avgRate + '%</td><td>' + totalOntime + '</td><td>' + totalLate + '</td><td>' + totalAbsent + '</td><td>' + totalDays + '</td></tr>';
    const htmlContent = '<html><head><meta charset="utf-8"><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:8px;text-align:center}th{background:#1e3a5f;color:#fff}.green{background:#86efac}.yellow{background:#fde047}.red{background:#fca5a5}</style></head><body><h2 style="text-align:center">LAPORAN KEHADIRAN KARYAWAN</h2><p style="text-align:center">Bulan: ' + currentMonth + ' ' + selectedYear + '</p><table><tr><th>No</th><th>Nama Karyawan</th><th>Kehadiran %</th><th>On Time</th><th>Telat</th><th>Absen</th><th>Hari Kerja</th></tr>' + tableRows + '</table></body></html>';
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Laporan-Kehadiran-' + currentMonth + '-' + selectedYear + '.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [monthlyStats, selectedMonth, selectedYear]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white">
            Analisa Kehadiran
          </h1>
          <p className="text-sm font-bold tracking-[0.4em] text-cyan-500 uppercase mt-2">
            Data Matrix v2.0
          </p>
        </div>
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-right">
          <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Avg. Attendance</p>
          <p className="text-3xl font-black text-white mt-1">
            {monthlyStats.length > 0 
              ? Math.round(monthlyStats.reduce((a, b) => a + b.attendanceRate, 0) / monthlyStats.length) 
              : 0}%
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white/5 p-2 rounded-2xl border border-white/5">
        {(['harian', 'bulanan'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 py-4 text-sm font-black tracking-widest rounded-xl transition-all ${
              activeTab === tab ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <ConnectionStatusBar 
        isConnected={isConnected} 
        lastSyncTime={lastSyncTime} 
        isRefreshing={isRefreshing} 
        onRefresh={handleRefresh} 
      />

      {/* Content Rendering */}
      {isPending ? (
        <div className="py-20 text-center animate-pulse">
          <span className="text-xs font-bold tracking-[0.5em] text-cyan-500">PROCESSING DATA...</span>
        </div>
      ) : activeTab === 'harian' ? (
        <DailyView
          dailyDate={dailyDate}
          onDailyDateChange={setDailyDate}
          todayRecords={uniqueTodayRecords}
          employeesWhoDidNotSubmit={employeesWhoDidNotSubmitToday}
          employees={employees}
          expandedCard={expandedCard}
          onToggleCard={setExpandedCard}
          getAttendanceStatus={getAttendanceStatus}
          getHealthColor={(c: HealthCondition) => c === 'healthy-no-symptoms' ? '#4ade80' : '#facc15'}
        />
      ) : (
        <MonthlyView
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          monthlyStats={monthlyStats}
          employees={employees}
          holidays={holidays}
          showHolidayForm={showHolidayForm}
          isMultiDay={isMultiDay}
          holidayDate={holidayDate}
          holidayEndDate={holidayEndDate}
          holidayName={holidayName}
          onToggleHolidayForm={() => setShowHolidayForm(!showHolidayForm)}
          onMultiDayChange={setIsMultiDay}
          onHolidayDateChange={setHolidayDate}
          onHolidayEndDateChange={setHolidayEndDate}
          onHolidayNameChange={setHolidayName}
          onAddHoliday={handleAddHoliday}
          onDeleteHoliday={deleteHoliday}
          onExportExcel={handleExportExcel}
        />
      )}

      {/* Database Fixer Tools */}
      <DatabaseFixer />

    </div>
  );
}

export default AnalisaKehadiran;