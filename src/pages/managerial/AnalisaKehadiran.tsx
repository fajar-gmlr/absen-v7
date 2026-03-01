import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calculateBusinessDays, calculateAbsentDays, expandHolidaysToDates } from '../../utils/timeUtils';
import type { HealthCondition, Holiday, Employee, AttendanceRecord } from '../../types';
import { ConnectionStatusBar, useConnectionStatus } from './components/ConnectionStatusBar';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';

type TabType = 'harian' | 'bulanan';

export function AnalisaKehadiran() {
  const { attendanceRecords, employees, holidays, addHoliday, deleteHoliday } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('harian');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Connection status hook
  const { isConnected, lastSyncTime, isRefreshing, handleRefresh } = useConnectionStatus();

  // Holiday CRUD states
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayEndDate, setHolidayEndDate] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Helper function: Tentukan status absen berdasarkan jam
  const getAttendanceStatus = (timestamp: string): 'ontime' | 'late' | 'invalid' => {
    const date = new Date(timestamp);
    const time = date.getHours() + date.getMinutes() / 60;

    if (time >= 5 && time <= 10) return 'ontime';
    if (time > 10 && time <= 17) return 'late';
    return 'invalid';
  };

  // Get local today string
  const getLocalToday = () => {
    const now = new Date();
    return now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
  };

  const [dailyDate, setDailyDate] = useState<string>(getLocalToday());

  // Filter valid records for selected date
  const todayRecords = useMemo(() =>
    attendanceRecords.filter((r: AttendanceRecord) => {
      const recordDate = r.timestamp.split('T')[0];
      const status = getAttendanceStatus(r.timestamp);
      return recordDate === dailyDate && status !== 'invalid';
    }), [attendanceRecords, dailyDate]);

  // Employees who did not submit
  const employeesWhoDidNotSubmit = useMemo(() =>
    employees.filter((emp: Employee) => !todayRecords.some((r: AttendanceRecord) => r.employeeId === emp.id)),
    [employees, todayRecords]);

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
  const monthlyStats = useMemo(() => {
    const currentMonth = selectedMonth;
    const currentYear = selectedYear;
    const todayObj = new Date();

    return employees.map((emp: Employee) => {
      const empRecords = attendanceRecords.filter((r: AttendanceRecord) => {
        const recordDate = new Date(r.timestamp);
        const isMatchMonth = recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        const status = getAttendanceStatus(r.timestamp);
        return r.employeeId === emp.id && isMatchMonth && status !== 'invalid';
      });

      const lateCount = empRecords.filter((r: AttendanceRecord) => getAttendanceStatus(r.timestamp) === 'late').length;

      const holidayDates = holidays.map((h: Holiday) => ({
        date: h.date,
        endDate: h.endDate || undefined
      }));

      const startDate = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      const totalBusinessDays = calculateBusinessDays(startDate, endOfMonth, holidayDates);

      let calcEndDate = endOfMonth;
      const isCurrentMonth = currentYear === todayObj.getFullYear() && currentMonth === todayObj.getMonth();
      const isFutureMonth = new Date(currentYear, currentMonth, 1) > todayObj;

      if (isCurrentMonth) {
        calcEndDate = todayObj;
      } else if (isFutureMonth) {
        calcEndDate = new Date(currentYear, currentMonth, 0);
      }

      // Expand holidays to individual dates for filtering
      const expandedHolidayDates = expandHolidaysToDates(holidayDates);

      // Get unique attendance dates
      const uniqueDates: Set<string> = new Set(
        empRecords.map((r: AttendanceRecord) => {
          const d = new Date(r.timestamp);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
      );

      // Filter out weekends and holidays from attendance count
      const validWorkDates = Array.from(uniqueDates).filter((dateStr) => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday) and holidays
        return dayOfWeek !== 0 && dayOfWeek !== 6 && !expandedHolidayDates.includes(dateStr);
      });

      const absenCount = validWorkDates.length;
      const tidakAbsenCount = isFutureMonth ? 0 : calculateAbsentDays(startDate, calcEndDate, uniqueDates, holidayDates);

      return {
        employee: emp,
        lateCount,
        absenCount,
        tidakAbsenCount,
        totalBusinessDays,
      };
    });
  }, [employees, attendanceRecords, holidays, selectedMonth, selectedYear]);

  // Handle add holiday
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayName) {
      alert('Silakan isi nama hari libur dan tanggal');
      return;
    }

    if (isMultiDay && !holidayEndDate) {
      alert('Silakan pilih tanggal akhir untuk libur beberapa hari');
      return;
    }

    // Build holiday object - only include endDate for multi-day holidays
    // Firebase doesn't allow undefined values
    const newHoliday: Holiday = {
      id: Date.now().toString(),
      date: holidayDate,
      name: holidayName,
      isCustom: true,
      isMultiDay: isMultiDay || false,
    };

    // Only add endDate for multi-day holidays
    if (isMultiDay && holidayEndDate) {
      newHoliday.endDate = holidayEndDate;
    }

    console.log('[AnalisaKehadiran] Adding holiday:', JSON.stringify(newHoliday));

    try {
      await addHoliday(newHoliday);
      console.log('[AnalisaKehadiran] Holiday added successfully');
      alert(`Hari libur "${holidayName}" berhasil ditambahkan!`);
      setHolidayDate('');
      setHolidayEndDate('');
      setHolidayName('');
      setIsMultiDay(false);
      // Keep form open for adding multiple holidays
    } catch (error) {
      console.error('[AnalisaKehadiran] Error adding holiday:', error);
      alert('Gagal menambahkan hari libur. Silakan coba lagi.');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const headers = ['Inisial', 'Nama Lengkap', 'Absen (hari)', 'Tidak Absen (hari)', 'Telat (hari)', 'Total Hari Kerja'];
    const rows = monthlyStats.map((stat: any) => [
      stat.employee.initial,
      stat.employee.fullName,
      stat.absenCount,
      stat.tidakAbsenCount,
      stat.lateCount,
      stat.totalBusinessDays
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kehadiran-${selectedMonth + 1}-${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <ConnectionStatusBar
        isConnected={isConnected}
        lastSyncTime={lastSyncTime}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

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
            className={`btn w-full py-2 ${activeTab === 'harian' ? 'border-primary' : ''}`}
          >
            <span className="btn-letter">H</span><span className="btn-letter">a</span>
            <span className="btn-letter">r</span><span className="btn-letter">i</span>
            <span className="btn-letter">a</span><span className="btn-letter">n</span>
          </button>
        </div>
        <div className="btn-wrapper flex-1">
          <button
            onClick={() => setActiveTab('bulanan')}
            className={`btn w-full py-2 ${activeTab === 'bulanan' ? 'border-primary' : ''}`}
          >
            <span className="btn-letter">B</span><span className="btn-letter">u</span>
            <span className="btn-letter">l</span><span className="btn-letter">a</span>
            <span className="btn-letter">n</span><span className="btn-letter">a</span>
            <span className="btn-letter">n</span>
          </button>
        </div>
      </div>

      {activeTab === 'harian' ? (
        <DailyView
          dailyDate={dailyDate}
          onDailyDateChange={setDailyDate}
          todayRecords={todayRecords}
          employeesWhoDidNotSubmit={employeesWhoDidNotSubmit}
          employees={employees}
          expandedCard={expandedCard}
          onToggleCard={setExpandedCard}
          getAttendanceStatus={getAttendanceStatus}
          getHealthColor={getHealthColor}
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
          onExportExcel={exportToExcel}
        />
      )}
    </div>
  );
}
