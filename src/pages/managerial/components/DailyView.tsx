import { formatTime } from '../../../utils/timeUtils';
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

export function DailyView({
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
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
        <label className="text-gray-300 font-medium">Berdasarkan Tanggal:</label>
        <input
          type="date"
          value={dailyDate}
          onChange={(e) => onDailyDateChange(e.target.value)}
          className="input max-w-[200px]"
        />
      </div>
      {/* Employees who submitted */}
      <div>
        <h3 className="font-semibold text-gray-100 mb-3">
          ✅ Sudah Absen ({todayRecords.length})
        </h3>
        <div className="space-y-2">
          {todayRecords.map((record) => {
            const isLate = getAttendanceStatus(record.timestamp) === 'late';
            return (
              <div key={record.id}>
                <button
                  onClick={() => onToggleCard(expandedCard === record.id ? null : record.id)}
                  className={`w-full card-3d p-3 text-left transition-smooth ${isLate ? 'border-l-4 border-late' : ''
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full animate-pulse-slow ${getHealthColor(record.healthCondition)}`} />
                      <span className="font-medium text-gray-100">
                        {record.employeeInitial} - {record.employeeName}
                      </span>
                      {isLate && (
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
                    {record.suggestions && (
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-gray-100">Saran/Laporan:</strong> {record.suggestions}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Absen: {formatTime(record.timestamp)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {todayRecords.length === 0 && (
            <p className="text-gray-500 text-center py-4">Belum ada yang absen hari ini</p>
          )}
        </div>
      </div>

      {/* Employees who did NOT submit */}
      <div>
        <h3 className="font-semibold text-gray-100 mb-3">
          ❌ Belum Absen / Invalid ({employeesWhoDidNotSubmit.length})
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
  );
}
