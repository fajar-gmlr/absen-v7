import { useState, useMemo, useTransition, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Holiday, Employee, AttendanceRecord, HealthCondition } from '../../types';
import { ConnectionStatusBar, useConnectionStatus } from './components/ConnectionStatusBar';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';

// ============================================
// TYPES & UTILS
// ============================================
type TabType = 'harian' | 'bulanan';

interface DailyStats {
  date: string;
  status: 'ontime' | 'late' | 'absent' | 'weekend' | 'holiday' | 'working' | 'sick' | 'symptom';
}

interface MonthlyStats {
  employee: Employee;
  ontimeCount: number;
  lateCount: number;
  absentCount: number;
  sickCount: number;
  symptomCount: number;
  totalBusinessDays: number;
  attendanceRate: number;
  dailyStats: DailyStats[];
}

const getAttendanceStatus = (timestamp: string): 'ontime' | 'late' | 'invalid' => {
  const date = new Date(timestamp);
  const totalMinutes = date.getHours() * 60 + date.getMinutes();

  if (totalMinutes < 5 * 60) return 'invalid'; 
  if (totalMinutes < 10 * 60) return 'ontime'; 
  return 'late'; 
};

const getCurrentTimeWIB = (): number => {
  const now = new Date();
  let wibHour = now.getUTCHours() + 7;
  if (wibHour >= 24) wibHour -= 24;
  return wibHour + now.getUTCMinutes() / 60;
};

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

const getHealthColor = (c: HealthCondition | undefined): string => {
  if (c === 'healthy-no-symptoms') return '#4ade80';
  if (c === 'has-symptoms-not-checked') return '#f97316';
  if (c === 'sick-checked-medical') return '#ef4444';
  return '#facc15'; 
};

// ============================================
// MAIN COMPONENT
// ============================================
export function AnalisaKehadiran() {
  const { attendanceRecords, employees, holidays, addHoliday, deleteHoliday } = useAppStore();
  
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>('harian');
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dailyDate, setDailyDate] = useState<string>(formatDateKey(new Date()));
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayEndDate, setHolidayEndDate] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [holidayName, setHolidayName] = useState('');

  const { isConnected, lastSyncTime, isRefreshing, handleRefresh } = useConnectionStatus();

  // ============================================
  // ANALYTICS ENGINE
  // ============================================

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

  const uniqueTodayRecords = useMemo(() => {
    const recordsForDate = attendanceRecords.filter(r => formatDateKey(new Date(r.timestamp)) === dailyDate);
    const sorted = [...recordsForDate].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const unique = new Map<string, AttendanceRecord>();
    for (const record of sorted) {
      if (!unique.has(record.employeeId)) {
        unique.set(record.employeeId, record);
      }
    }
    return Array.from(unique.values());
  }, [attendanceRecords, dailyDate]);

  const employeesWhoDidNotSubmitToday = useMemo(() => {
    return employees.filter(e => !uniqueTodayRecords.some(r => r.employeeId === e.id));
  }, [employees, uniqueTodayRecords]);

  const monthlyStats = useMemo((): MonthlyStats[] => {
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayKey = formatDateKey(today);
    const past17WIBToday = isPast17WIB();

    return employees.map(emp => {
      const empRecords = monthlyRecordsMap.get(emp.id) || [];
      
      const sortedEmpRecords = [...empRecords].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const recordDates = new Map<string, AttendanceRecord>();
      sortedEmpRecords.forEach(r => {
        const dateKey = formatDateKey(new Date(r.timestamp));
        if (!recordDates.has(dateKey)) {
          recordDates.set(dateKey, r);
        }
      });
      
      const dailyStats: DailyStats[] = [];
      let ontime = 0, late = 0, absent = 0, sick = 0, symptom = 0, bizDays = 0;

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
            if (record.healthCondition === 'sick-checked-medical') {
                status = 'sick';
                sick++;
            } else if (record.healthCondition === 'has-symptoms-not-checked') {
                status = 'symptom';
                symptom++;
            } else {
                const recordTime = new Date(record.timestamp);
                const recordHour = recordTime.getHours();
                if (recordHour >= 17) {
                  status = 'absent';
                  absent++;
                } else {
                  status = getAttendanceStatus(record.timestamp) === 'late' ? 'late' : 'ontime';
                  if (status === 'late') late++; else ontime++;
                }
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
        sickCount: sick,
        symptomCount: symptom,
        totalBusinessDays: bizDays,
        attendanceRate: bizDays > 0 ? Math.round(((ontime + late) / bizDays) * 100) : 0,
        dailyStats
      };
    });
  }, [employees, monthlyRecordsMap, expandedHolidayDates, selectedMonth, selectedYear]);

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

  // EXPORT EXCEL DENGAN PENENTUAN LEBAR KOLOM DAN TINGGI BARIS YANG PRESISI
  const handleExportExcel = useCallback(() => {
    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthEn = monthNamesEn[selectedMonth];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 1. Definisikan lebar kolom secara manual untuk memaksa Excel
    let colDefinitions = `<col width="250">`; // Kolom Nama Employee (Lebar)
    for (let i = 1; i <= daysInMonth; i++) {
        colDefinitions += `<col width="35">`; // Kolom Tanggal (Kotak presisi)
    }
    colDefinitions += `<col width="80">`; // Kolom Total Days

    const dailyTotals: number[] = new Array(daysInMonth).fill(0);
    let employeeRows = '';
    let grandTotal = 0;

    // 2. Data Karyawan (Dengan fixed height)
    monthlyStats.forEach((stat) => {
      let rowHtml = `<tr height="25">`;
      rowHtml += `<td style="font-weight:bold; border: 1px solid #ffffff; background-color: #f2f2f2; font-family: Calibri, sans-serif; font-size:11pt; padding-left: 5px;">${stat.employee.fullName}</td>`;
      
      let totalDays = 0; 

      for (let i = 1; i <= daysInMonth; i++) {
        const dKey = formatDateKey(new Date(selectedYear, selectedMonth, i));
        const dayStat = stat.dailyStats.find(d => d.date === dKey);
        const st = dayStat?.status || 'working';

        let cellContent = '';
        let bgColor = '#ffffff'; 
        let fontColor = '#000000';

        if (st === 'weekend' || st === 'holiday') {
            bgColor = '#e7e6e6'; 
        } else {
            if (st === 'ontime') {
                cellContent = 'V'; bgColor = '#3cb371'; fontColor = '#000000'; totalDays++; dailyTotals[i-1]++;
            } else if (st === 'late') {
                cellContent = 'L'; bgColor = '#d9d9d9'; fontColor = '#000000'; totalDays++;
            } else if (st === 'symptom') {
                cellContent = 'H'; bgColor = '#f97316'; fontColor = '#ffffff';
            } else if (st === 'sick') {
                cellContent = 'S'; bgColor = '#4169e1'; fontColor = '#ffffff';
            } else if (st === 'absent') {
                cellContent = 'A'; bgColor = '#ff0000'; fontColor = '#ffffff';
            }
        }
        rowHtml += `<td style="border: 1px solid #ffffff; text-align:center; font-weight:bold; background-color:${bgColor}; color:${fontColor}; font-family: Calibri, sans-serif;">${cellContent}</td>`;
      }
      
      rowHtml += `<td style="border: 1px solid #ffffff; background-color: #f2f2f2; text-align:center; font-weight:bold; font-family: Calibri, sans-serif;">${totalDays}</td>`;
      rowHtml += `</tr>`;
      employeeRows += rowHtml;
      grandTotal += totalDays;
    });

    // 3. Header Tanggal dan Hari (Dengan fixed height)
    let dowRow = `<tr height="20"><td style="border-bottom: 2px solid #000;"></td>`;
    let dateRow = `<tr height="25"><td style="border-top: 2px solid #000; font-family: Calibri, sans-serif; font-size:12pt; font-weight:bold; vertical-align:bottom;">Employee name</td>`;
    let bottomTotalRow = `<tr height="25"><td style="background-color: #a6b5c0; border: 1px solid #ffffff; font-weight:bold; font-family: Calibri, sans-serif; padding-left: 5px;">${currentMonthEn} total</td>`;

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(selectedYear, selectedMonth, i);
        const dow = daysOfWeek[currentDate.getDay()];
        const dKey = formatDateKey(currentDate);
        
        const isHoliday = expandedHolidayDates.has(dKey) || isWeekend(currentDate);
        const dateBg = isHoliday ? '#ff0000' : '#4f6268'; 
        
        dowRow += `<td style="text-align:center; border-bottom: 2px solid #000; font-family: Calibri, sans-serif; font-size:10pt;">${dow}</td>`;
        dateRow += `<td style="background-color: ${dateBg}; color: white; border: 1px solid #ffffff; text-align:center; font-weight:bold; font-family: Calibri, sans-serif;">${i}</td>`;
        
        const totalPerDay = dailyTotals[i-1] > 0 ? dailyTotals[i-1] : '';
        bottomTotalRow += `<td style="background-color: #a6b5c0; border: 1px solid #ffffff; text-align:center; font-weight:bold; font-family: Calibri, sans-serif;">${totalPerDay}</td>`; 
    }

    dowRow += `<td></td></tr>`;
    dateRow += `<td style="border-top: 2px solid #000; font-family: Calibri, sans-serif; font-size:11pt; font-weight:bold; text-align:center;">Total days</td></tr>`;
    bottomTotalRow += `<td style="background-color: #a6b5c0; border: 1px solid #ffffff; text-align:center; font-weight:bold; font-family: Calibri, sans-serif;">${grandTotal}</td></tr>`;

    // 4. Struktur HTML Utama
    const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        table { border-collapse: collapse; }
        td { white-space: nowrap; vertical-align: middle; }
      </style>
    </head>
    <body>
      <table>
        ${colDefinitions} <tr height="40">
          <td colspan="5" style="font-family: Calibri, sans-serif; font-size: 28pt; font-weight: bold; color: #4472c4; vertical-align: middle;">
            ${currentMonthEn}
          </td>
          <td colspan="${daysInMonth - 3}"></td>
        </tr>
        <tr height="15"><td colspan="${daysInMonth + 2}" style="border-bottom: 2px solid #000;"></td></tr>
        
        <tr height="25">
          <td style="font-family: Calibri, sans-serif; font-size:11pt; font-weight:bold;">Absence type key</td>
          <td style="background-color:#3cb371; text-align:center; font-weight:bold; border: 1px solid #fff;">V</td>
          <td style="font-family: Calibri, sans-serif; padding-left:5px;">Ready</td>
          <td style="background-color:#d9d9d9; text-align:center; font-weight:bold; border: 1px solid #fff;">L</td>
          <td style="font-family: Calibri, sans-serif; padding-left:5px;">Late</td>
          <td style="background-color:#f97316; color:white; text-align:center; font-weight:bold; border: 1px solid #fff;">H</td>
          <td style="font-family: Calibri, sans-serif; padding-left:5px;">Symptom</td>
          <td style="background-color:#4169e1; color:white; text-align:center; font-weight:bold; border: 1px solid #fff;">S</td>
          <td style="font-family: Calibri, sans-serif; padding-left:5px;">Sick</td>
          <td style="background-color:#ff0000; color:white; text-align:center; font-weight:bold; border: 1px solid #fff;">A</td>
          <td style="font-family: Calibri, sans-serif; padding-left:5px;" colspan="${daysInMonth - 9}">Absent</td>
        </tr>
        <tr height="15"><td colspan="${daysInMonth + 2}" style="border-bottom: 2px solid #000;"></td></tr>
        
        <tr height="30">
          <td colspan="${daysInMonth}" style="font-family: Calibri, sans-serif; font-size: 16pt; font-weight: bold; vertical-align: bottom;">
            Dates of Absence
          </td>
          <td colspan="2" style="font-family: Calibri, sans-serif; font-size: 16pt; font-weight: bold; text-align: center; vertical-align: bottom;">
            ${selectedYear}
          </td>
        </tr>
        
        ${dowRow}
        ${dateRow}
        ${employeeRows}
        <tr height="15"><td colspan="${daysInMonth + 2}"></td></tr>
        ${bottomTotalRow}
      </table>
    </body>
    </html>`;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Matrix_${currentMonthEn}_${selectedYear}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [monthlyStats, selectedMonth, selectedYear, expandedHolidayDates]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-4 sm:pb-6">
        <div className="w-full sm:w-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-white break-words">
            Analisa Kehadiran
          </h1>
          <p className="text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.4em] text-cyan-500 uppercase mt-2">
            Data Matrix v2.0
          </p>
        </div>
        <div className="w-full sm:w-auto bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-row sm:flex-col justify-between items-center sm:items-end">
          <p className="text-[10px] sm:text-xs text-white/40 uppercase font-bold tracking-widest">Avg. Attendance</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-0 sm:mt-1">
            {monthlyStats.length > 0 
              ? Math.round(monthlyStats.reduce((a, b) => a + b.attendanceRate, 0) / monthlyStats.length) 
              : 0}%
          </p>
        </div>
      </div>

      <div className="flex bg-white/5 p-1 sm:p-2 rounded-xl sm:rounded-2xl border border-white/5">
        {(['harian', 'bulanan'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-black tracking-widest rounded-lg sm:rounded-xl transition-all ${
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
          onExportExcel={handleExportExcel} // <-- Menggunakan handleExportExcel
        />
      )}
    </div>
  );
}

export default AnalisaKehadiran;