import { memo } from 'react';
import type { Holiday, Employee } from '../../../types';

interface DailyStats {
  date: string;
  status: 'healthy' | 'late' | 'absent' | 'weekend' | 'holiday' | 'working' | 'sick' | 'symptom';
}

interface MonthlyStats {
  employee: Employee;
  healthyCount: number;
  lateCount: number;
  absentCount: number;
  sickCount: number;
  symptomCount: number; 
  totalBusinessDays: number;
  attendanceRate: number;
  dailyStats: DailyStats[];
}

interface MonthlyViewProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  monthlyStats: MonthlyStats[];
  employees: Employee[];
  holidays: Holiday[];
  showHolidayForm: boolean;
  isMultiDay: boolean;
  holidayDate: string;
  holidayEndDate: string;
  holidayName: string;
  onToggleHolidayForm: () => void;
  onMultiDayChange: (value: boolean) => void;
  onHolidayDateChange: (date: string) => void;
  onHolidayEndDateChange: (date: string) => void;
  onHolidayNameChange: (name: string) => void;
  onAddHoliday: (e: React.FormEvent) => void;
  onDeleteHoliday: (id: string) => void;
  onExportExcel: () => void;
}

const MONTHS = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

export const MonthlyView = memo(function MonthlyView({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  monthlyStats,
  holidays,
  showHolidayForm,
  isMultiDay,
  holidayDate,
  holidayEndDate,
  holidayName,
  onToggleHolidayForm,
  onMultiDayChange,
  onHolidayDateChange,
  onHolidayEndDateChange,
  onHolidayNameChange,
  onAddHoliday,
  onDeleteHoliday,
  onExportExcel,
}: MonthlyViewProps) {
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 w-full">
      
      {/* SELECTOR BULAN & TAHUN */}
      <div className="bg-black/40 border border-white/5 p-4 sm:p-8 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => onMonthChange(prevMonth)} className="text-white/30 hover:text-cyan-400 transition-all text-xl sm:text-2xl p-2 sm:p-3">◀</button>
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-2 sm:gap-4">
              <span className="hidden md:inline text-xs sm:text-sm font-bold tracking-[0.3em] text-white/20 uppercase">{MONTHS[prevMonth].slice(0,3)}</span>
              <span className="text-xl sm:text-3xl font-black tracking-tight text-white px-2 sm:px-8 md:border-x border-white/10 text-center min-w-[150px] sm:min-w-[280px]">{MONTHS[selectedMonth]}</span>
              <span className="hidden md:inline text-xs sm:text-sm font-bold tracking-[0.3em] text-white/20 uppercase">{MONTHS[nextMonth].slice(0,3)}</span>
            </div>
          </div>
          <button onClick={() => onMonthChange(nextMonth)} className="text-white/30 hover:text-cyan-400 transition-all text-xl sm:text-2xl p-2 sm:p-3">▶</button>
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-8">
          <button onClick={() => onYearChange(selectedYear - 1)} className="text-white/30 hover:text-cyan-400 transition-all text-lg sm:text-xl p-2 sm:p-3">◀</button>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white px-6 sm:px-10 min-w-[100px] sm:min-w-[140px] text-center">{selectedYear}</span>
          <button onClick={() => onYearChange(selectedYear + 1)} className="text-white/30 hover:text-cyan-400 transition-all text-lg sm:text-xl p-2 sm:p-3">▶</button>
        </div>
      </div>

      {/* DATA TABLE MATRIX */}
      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold text-white/40 uppercase tracking-widest">Employee</th>
                <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold text-white/40 uppercase tracking-widest text-center">Trend</th>
                <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold text-white/40 uppercase tracking-widest">Attendance Matrix (31 Days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {monthlyStats.map((stat) => (
                <tr key={stat.employee.id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="p-3 sm:p-5">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm sm:text-lg bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        {stat.employee.initial}
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{stat.employee.fullName}</p>
                        <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider mt-1">ID: {stat.employee.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-3 sm:p-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`inline-block px-3 sm:px-5 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide ${
                        stat.attendanceRate >= 90 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        stat.attendanceRate >= 70 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {stat.attendanceRate}%
                      </span>
                      <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs text-white/50 flex-wrap justify-center">
                        <span className="flex items-center gap-1 whitespace-nowrap" title="Healthy"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span> {stat.healthyCount}</span>
                        <span className="flex items-center gap-1 whitespace-nowrap" title="Late"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"></span> {stat.lateCount}</span>
                        <span className="flex items-center gap-1 whitespace-nowrap" title="Symptoms"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500"></span> {stat.symptomCount}</span>
                        <span className="flex items-center gap-1 whitespace-nowrap" title="Sick"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span> {stat.sickCount}</span>
                        <span className="flex items-center gap-1 whitespace-nowrap" title="Absent"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></span> {stat.absentCount}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-3 sm:p-5">
                    <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                      {stat.dailyStats.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          className={`w-2.5 sm:w-3 h-6 sm:h-8 rounded-[1px] sm:rounded-sm transition-all duration-500 shrink-0 ${
                            day.status === 'healthy' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                            day.status === 'symptom' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' :
                            day.status === 'late' ? 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.7)]' :
                            day.status === 'absent' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                            day.status === 'sick' ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' :
                            day.status === 'holiday' ? 'bg-white/30' :
                            day.status === 'working' ? 'bg-blue-500/30' :
                            'bg-white/5'
                          }`}
                          title={`${day.date}: ${day.status.toUpperCase()}`}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPORT ACTION */}
      <div className="flex justify-start">
        <button onClick={onExportExcel} className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-cyan-500/50 transition-all active:scale-95 shadow-xl group">
          <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform">📥</span>
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">Export Analytics</span>
        </button>
      </div>

      {/* HOLIDAY MANAGER SECTION */}
      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
        <button onClick={onToggleHolidayForm} className="w-full flex items-center justify-between p-4 sm:p-6 text-white hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xl sm:text-2xl">📅</span>
            <span className="text-xs sm:text-sm font-black tracking-[0.1em] sm:tracking-[0.2em] uppercase text-left">Holiday Matrix Manager</span>
          </div>
          <span className={`text-lg sm:text-xl transition-transform duration-300 ${showHolidayForm ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {showHolidayForm && (
          <div className="p-4 sm:p-6 border-t border-white/5 space-y-4 sm:space-y-6 animate-in slide-in-from-top-4">
            <form onSubmit={onAddHoliday} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/5">
                  <input type="checkbox" id="multiDayMonthly" checked={isMultiDay} onChange={(e) => onMultiDayChange(e.target.checked)} className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/10 bg-black text-cyan-500 focus:ring-cyan-500" />
                  <label htmlFor="multiDayMonthly" className="text-xs sm:text-sm font-bold text-white/60 uppercase tracking-wider cursor-pointer">Rentang Hari (Multi-day)</label>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] sm:text-xs font-bold text-white/30 uppercase ml-1">Mulai</p>
                    <input type="date" value={holidayDate} onChange={(e) => onHolidayDateChange(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 sm:p-4 text-sm sm:text-base text-white focus:border-cyan-500 outline-none" required />
                  </div>
                  {isMultiDay && (
                    <div className="space-y-2">
                      <p className="text-[10px] sm:text-xs font-bold text-white/30 uppercase ml-1">Selesai</p>
                      <input type="date" value={holidayEndDate} onChange={(e) => onHolidayEndDateChange(e.target.value)} min={holidayDate} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 sm:p-4 text-sm sm:text-base text-white focus:border-cyan-500 outline-none" required />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <p className="text-[10px] sm:text-xs font-bold text-white/30 uppercase ml-1">Nama Hari Libur</p>
                  <input type="text" value={holidayName} onChange={(e) => onHolidayNameChange(e.target.value)} placeholder="Contoh: Libur Lebaran" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 sm:p-4 text-sm sm:text-base text-white focus:border-cyan-500 outline-none" required />
                </div>
                <button type="submit" className="w-full py-3 sm:py-4 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-400 text-xs sm:text-sm font-black tracking-[0.1em] sm:tracking-[0.2em] uppercase hover:bg-cyan-500/30 transition-all shadow-lg">SIMPAN KE DATABASE</button>
              </div>
            </form>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/5">
              {holidays.length > 0 ? (
                holidays.map((h) => (
                  <div key={h.id} className="flex justify-between items-center p-3 sm:p-4 bg-white/[0.03] border border-white/5 rounded-xl group hover:border-cyan-500/30 transition-all">
                    <div>
                      <p className="text-sm sm:text-base font-bold text-white">{h.name}</p>
                      <p className="text-xs sm:text-sm text-white/40 font-mono tracking-wider mt-1">{h.date} {h.endDate ? `→ ${h.endDate}` : ''}</p>
                    </div>
                    <button onClick={() => onDeleteHoliday(h.id)} className="p-2 sm:p-3 text-lg sm:text-xl text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-lg">🗑️</button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 sm:py-6 text-center text-white/20 text-xs sm:text-sm font-bold tracking-widest uppercase">No Holidays Configured</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MonthlyView;