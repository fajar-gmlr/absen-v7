import { formatDate } from '../../../utils/timeUtils';
import type { Holiday, Employee } from '../../../types';

interface MonthlyStats {
  employee: Employee;
  lateCount: number;
  absenCount: number;
  tidakAbsenCount: number;
  totalBusinessDays: number;
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

export function MonthlyView({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  monthlyStats,
  employees,
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
  return (
    <div className="space-y-4">
      {/* Month/Year Selector and Export */}
      <div className="card-3d p-4">
        <div className="flex gap-2 mb-3">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
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
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="flex-1 p-2 border border-gray-700 rounded-card text-sm input-3d text-gray-100"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year} className="text-gray-900">{year}</option>
            ))}
          </select>
        </div>
        
        <div className="btn-wrapper w-full">
          <button
            onClick={onExportExcel}
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
      <HolidayManagement
        holidays={holidays}
        showForm={showHolidayForm}
        isMultiDay={isMultiDay}
        holidayDate={holidayDate}
        holidayEndDate={holidayEndDate}
        holidayName={holidayName}
        onToggleForm={onToggleHolidayForm}
        onMultiDayChange={onMultiDayChange}
        onDateChange={onHolidayDateChange}
        onEndDateChange={onHolidayEndDateChange}
        onNameChange={onHolidayNameChange}
        onSubmit={onAddHoliday}
        onDelete={onDeleteHoliday}
      />

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
  );
}

// Holiday Management Sub-component
interface HolidayManagementProps {
  holidays: Holiday[];
  showForm: boolean;
  isMultiDay: boolean;
  holidayDate: string;
  holidayEndDate: string;
  holidayName: string;
  onToggleForm: () => void;
  onMultiDayChange: (value: boolean) => void;
  onDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
}

export function HolidayManagement({
  holidays,
  showForm,
  isMultiDay,
  holidayDate,
  holidayEndDate,
  holidayName,
  onToggleForm,
  onMultiDayChange,
  onDateChange,
  onEndDateChange,
  onNameChange,
  onSubmit,
  onDelete,
}: HolidayManagementProps) {
  const getHolidayDuration = (holiday: Holiday): number => {
    if (!holiday.endDate) return 1;
    const start = new Date(holiday.date);
    const end = new Date(holiday.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="card-3d p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-100">📅 Hari Libur</h3>
        <div className="btn-wrapper">
          <button
            onClick={onToggleForm}
            className="btn text-sm px-3 py-1"
          >
            <span className="btn-letter">
              {showForm ? 'Batal' : '+ Tambah'}
            </span>
          </button>
        </div>
      </div>
      
      {showForm && (
        <form onSubmit={onSubmit} className="space-y-2 mb-3">
          {/* Multi-day toggle */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="multiDay"
              checked={isMultiDay}
              onChange={(e) => {
                onMultiDayChange(e.target.checked);
                if (!e.target.checked) {
                  onEndDateChange('');
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
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-2 border border-gray-700 rounded-card text-sm input-3d text-gray-100"
            required
          />
          
          {isMultiDay && (
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Sampai tanggal:</label>
              <input
                type="date"
                value={holidayEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={holidayDate}
                className="w-full p-2 border border-gray-700 rounded-card text-sm input-3d text-gray-100"
                required={isMultiDay}
              />
            </div>
          )}
          
          <input
            type="text"
            value={holidayName}
            onChange={(e) => onNameChange(e.target.value)}
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
                  {holiday.isMultiDay && holiday.endDate && <span className="ml-1 text-primary">({getHolidayDuration(holiday)} hari)</span>}
                </p>
              </div>
              <button
                onClick={() => onDelete(holiday.id)}
                className="text-danger text-xs px-2 py-1 hover:bg-red-900/30 rounded transition-smooth"
              >
                Hapus
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
