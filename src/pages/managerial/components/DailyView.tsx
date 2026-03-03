
import { memo } from 'react';
import type { AttendanceRecord, HealthCondition } from '../../../types';

interface DailyViewProps {
  dailyDate: string;
  onDailyDateChange: (date: string) => void;
  todayRecords: AttendanceRecord[];
  employeesWhoDidNotSubmit: { id: string; initial: string; fullName: string }[];
  employees: { id: string; initial: string; fullName: string }[];
  expandedCard: string | null;
  onToggleCard: (id: string | null) => void;
  getAttendanceStatus: (timestamp: string) => 'ontime' | 'late' | 'invalid';
  getHealthColor: (condition: HealthCondition) => string;
}

export const DailyView = memo(function DailyView({
  dailyDate,
  onDailyDateChange,
  todayRecords,
  employeesWhoDidNotSubmit,
  employees,
  expandedCard,
  onToggleCard,
  getAttendanceStatus,
  getHealthColor,
}: DailyViewProps) {
  // Format time for display
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-black/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <label className="text-base font-medium text-white/70">Select Date:</label>
          <input
            type="date"
            value={dailyDate}
            onChange={(e) => onDailyDateChange(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-base text-white focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Employees who submitted */}
      <div className="bg-black/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
        <h3 className="font-bold text-lg text-white mb-5 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
          ✅ Already Checked In ({todayRecords.length})
        </h3>
        
        <div className="space-y-3">
          {todayRecords.map((record) => {
            const isLate = getAttendanceStatus(record.timestamp) === 'late';
            // Show custom work location if "lainnya" was selected
            const displayLocation = record.workLocation === 'lainnya' && record.customWorkLocation 
              ? record.customWorkLocation 
              : record.workLocation;
            return (
              <div key={record.id}>
                <button
                  onClick={() => onToggleCard(expandedCard === record.id ? null : record.id)}
                  className={`w-full text-left transition-all duration-200 ${
                    isLate 
                      ? 'bg-purple-500/10 border-l-4 border-purple-500' 
                      : 'bg-emerald-500/10 border-l-4 border-emerald-500'
                  } rounded-xl p-4 hover:bg-white/5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        {record.employeeInitial}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">
                          {record.employeeName}
                        </p>
                        <p className="text-sm text-white/50 mt-1">
                          {displayLocation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Health Condition Lamp */}
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ 
                          backgroundColor: getHealthColor(record.healthCondition),
                          boxShadow: `0 0 10px ${getHealthColor(record.healthCondition)}`
                        }}
                        title={`Health: ${record.healthCondition === 'healthy-no-symptoms' ? 'Healthy' : 
                          record.healthCondition === 'has-symptoms-not-checked' ? 'Has Symptoms' : 'Sick'}`
                        }
                      />
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        isLate 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {isLate ? 'Late' : 'On Time'}
                      </span>
                      <span className="text-xl font-mono text-white font-bold">
                        {formatTime(record.timestamp)}
                      </span>
                      <span className="text-white/30 text-xl">
                        {expandedCard === record.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                </button>

                {expandedCard === record.id && (
                  <div className="mt-3 p-5 bg-black/30 rounded-xl border border-white/10">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Work Location</p>
                        <p className="text-base text-white mt-1">{displayLocation}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Yesterday</p>
                        <p className="text-base text-white mt-1">{record.yesterdayWork || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Today</p>
                        <p className="text-base text-white mt-1">{record.todayWork || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Tomorrow</p>
                        <p className="text-base text-white mt-1">{record.tomorrowAgenda || '-'}</p>
                      </div>
                      {record.suggestions && (
                        <div className="col-span-2">
                          <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Notes</p>
                          <p className="text-base text-white mt-1">{record.suggestions}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getHealthColor(record.healthCondition) }}></span>
                        <span className="text-base text-white/60">
                          {record.healthCondition === 'healthy-no-symptoms' ? 'Healthy' : 
                           record.healthCondition === 'has-symptoms-not-checked' ? 'Has Symptoms' : 'Sick'}
                        </span>
                      </div>
                      <span className="text-base text-white/40">
                        Checked in: {formatTime(record.timestamp)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {todayRecords.length === 0 && (
            <div className="text-center py-10 text-white/40 text-lg">
              No check-ins recorded for this date
            </div>
          )}
        </div>
      </div>

      {/* Employees who did NOT submit */}
      <div className="bg-black/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
        <h3 className="font-bold text-lg text-white mb-5 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></span>
          ❌ Not Checked In ({employeesWhoDidNotSubmit.length})
        </h3>
        
        <div className="space-y-3">
          {employeesWhoDidNotSubmit.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <div className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center text-white/50 font-bold text-lg bg-white/5">
                {emp.initial}
              </div>
              <div className="flex-1">
                <p className="text-lg text-white/70 font-medium">{emp.fullName}</p>
              </div>
              <span className="text-sm font-bold text-red-400 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30">
                Absent
              </span>
            </div>
          ))}
          {employeesWhoDidNotSubmit.length === 0 && employees.length > 0 && (
            <div className="text-center py-8 text-emerald-400 text-lg font-bold bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              🎉 All employees have checked in!
            </div>
          )}
          {employees.length === 0 && (
            <div className="text-center py-8 text-white/40 text-lg">
              No employees registered
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DailyView;

