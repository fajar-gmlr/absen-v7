import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { checkTimeGate, getTimestamp } from '../utils/timeUtils';
import type { AttendanceRecord, HealthCondition, AttendanceStatus } from '../types';

const WORK_LOCATIONS = [
  'Kantor Ciwastra',
  'Kantor Tebet',
  'Kantor Balikpapan',
  'Ditmet Bandung',
  'Tempat Tinggal',
  'Lainnya',
] as const;

const HEALTH_CONDITIONS: { value: HealthCondition; label: string }[] = [
  { value: 'healthy-no-symptoms', label: 'Sehat, dan tidak ada gejala' },
  { value: 'has-symptoms-not-checked', label: 'Ada gejala, belum periksa tenaga medis' },
  { value: 'sick-checked-medical', label: 'Sakit, sudah periksa tenaga medis' },
];

export function Absensi() {
  const { employees, addAttendance, hasSubmittedToday } = useAppStore();
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [customWorkLocation, setCustomWorkLocation] = useState('');
  const [healthCondition, setHealthCondition] = useState<HealthCondition>('' as HealthCondition);
  const [yesterdayWork, setYesterdayWork] = useState('');
  const [todayWork, setTodayWork] = useState('');
  const [tomorrowAgenda, setTomorrowAgenda] = useState('');
  const [suggestions, setSuggestions] = useState('');
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupStatus, setPopupStatus] = useState<'success' | 'error' | 'warning'>('success');
  
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());

  const validateForm = (): boolean => {
    // 1. Gather all default required fields
    const requiredFields = [
      { key: 'employee', value: selectedEmployee },
      { key: 'workLocation', value: workLocation },
      { key: 'healthCondition', value: healthCondition },
      { key: 'yesterdayWork', value: yesterdayWork },
      { key: 'todayWork', value: todayWork },
      { key: 'tomorrowAgenda', value: tomorrowAgenda },
      { key: 'suggestions', value: suggestions },
    ];

    // 2. Only require customWorkLocation if "Lainnya" is selected
    if (workLocation === 'Lainnya') {
      requiredFields.push({ key: 'customWorkLocation', value: customWorkLocation });
    }

    // 3. Find any fields that are empty (handling potential null/undefined values safely)
    const emptyFields = requiredFields.filter(f => !f.value || (typeof f.value === 'string' && !f.value.trim()));
    
    // 4. If there are empty fields, trigger the shake animation and block submission
    if (emptyFields.length > 0) {
      setShakeFields(new Set(emptyFields.map(f => f.key)));
      setTimeout(() => setShakeFields(new Set()), 500);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check time gate first
    const timeGate = checkTimeGate();
    
    if (!timeGate.allowed) {
      setPopupStatus('error');
      setPopupMessage(timeGate.message);
      setShowPopup(true);
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check for duplicate submission
    if (selectedEmployee && hasSubmittedToday(selectedEmployee)) {
      setPopupStatus('warning');
      setPopupMessage('Anda sudah absen hari ini!');
      setShowPopup(true);
      return;
    }

    // Get employee details
    const employee = employees.find(emp => emp.id === selectedEmployee);
    
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      employeeId: selectedEmployee,
      employeeInitial: employee?.initial || 'N/A',
      employeeName: employee?.fullName || 'Unknown',
      workLocation,
      customWorkLocation: workLocation === 'Lainnya' ? customWorkLocation : null,
      healthCondition,
      yesterdayWork,
      todayWork,
      tomorrowAgenda,
      suggestions,
      timestamp: getTimestamp(),
      status: timeGate.status as AttendanceStatus,
    };

    try {
      await addAttendance(record);
      setPopupStatus(timeGate.status === 'late' ? 'warning' : 'success');
      setPopupMessage(timeGate.message);
      setShowPopup(true);
      
      // Reset form
      setSelectedEmployee('');
      setWorkLocation('');
      setCustomWorkLocation('');
      setHealthCondition('' as HealthCondition);
      setYesterdayWork('');
      setTodayWork('');
      setTomorrowAgenda('');
      setSuggestions('');
    } catch (error) {
      setPopupStatus('error');
      setPopupMessage('Gagal menyimpan absensi. Silakan coba lagi.');
      setShowPopup(true);
    }
  };

  const inputClass = (fieldName: string) =>
    `w-full px-4 py-3 rounded-input input-3d text-gray-100 placeholder-gray-500 focus:outline-none min-h-touch ${
      shakeFields.has(fieldName) ? 'border-danger shake' : ''
    }`;

  return (
    <Layout title="Absensi Harian">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div className="card-3d rounded-card p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Inisial - Nama Lengkap <span className="text-danger">*</span>
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className={inputClass('employee')}
            >
              <option value="" className="text-gray-900">Pilih Karyawan</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id} className="text-gray-900">
                  {emp.initial} - {emp.fullName}
                </option>
              ))}
              {employees.length === 0 && (
                <option value="" disabled className="text-gray-900">
                  Tidak ada karyawan. Hubungi manager.
                </option>
              )}
            </select>
          </div>

          {/* Work Location */}
          <div className="card-3d rounded-card p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lokasi Kerja <span className="text-danger">*</span>
            </label>
            <select
              value={workLocation}
              onChange={(e) => {
                setWorkLocation(e.target.value);
                if (e.target.value !== 'Lainnya') {
                  setCustomWorkLocation('');
                }
              }}
              className={inputClass('workLocation')}
            >
              <option value="" className="text-gray-900">Pilih Lokasi</option>
              {WORK_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} className="text-gray-900">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Work Location (conditional) */}
          {workLocation === 'Lainnya' && (
            <div className="card-3d rounded-card p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lokasi Kerja Lainnya <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={customWorkLocation}
                onChange={(e) => setCustomWorkLocation(e.target.value)}
                placeholder="Masukkan lokasi kerja"
                className={inputClass('customWorkLocation')}
              />
            </div>
          )}

          {/* Health Condition */}
          <div className="card-3d rounded-card p-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Kondisi Kesehatan <span className="text-danger">*</span>
            </label>
            <div className="space-y-3">
              {HEALTH_CONDITIONS.map((condition) => (
                <label
                  key={condition.value}
                  className={`flex items-center p-3 rounded-button cursor-pointer transition-3d ${
                    shakeFields.has('healthCondition')
                      ? 'border border-danger bg-red-500/10 shake'
                      : healthCondition === condition.value
                      ? 'btn-3d text-primary'
                      : 'input-3d text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="healthCondition"
                    value={condition.value}
                    checked={healthCondition === condition.value}
                    onChange={(e) => setHealthCondition(e.target.value as HealthCondition)}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <span className="ml-3 text-sm">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Yesterday Work */}
          <div className="card-3d rounded-card p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Laporan pekerjaan hari sebelumnya <span className="text-danger">*</span>
            </label>
            <textarea
              value={yesterdayWork}
              onChange={(e) => setYesterdayWork(e.target.value)}
              rows={3}
              placeholder="Apa pekerjaan yang telah diselesaikan?"
              className={inputClass('yesterdayWork')}
            />
          </div>

          {/* Today Work */}
          <div className="card-3d rounded-card p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pekerjaan hari ini <span className="text-danger">*</span>
            </label>
            <textarea
              value={todayWork}
              onChange={(e) => setTodayWork(e.target.value)}
              rows={3}
              placeholder="Apa rencana pekerjaan hari ini?"
              className={inputClass('todayWork')}
            />
          </div>

          {/* Tomorrow Agenda */}
          <div className="card-3d rounded-card p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Agenda besok <span className="text-danger">*</span>
            </label>
            <textarea
              value={tomorrowAgenda}
              onChange={(e) => setTomorrowAgenda(e.target.value)}
              rows={2}
              placeholder="Apa rencana pekerjaan untuk besok?"
              className={inputClass('tomorrowAgenda')}
            />
          </div>

          {/* Suggestions */}
          <div className="card-3d rounded-card p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Saran dan/atau Laporan <span className="text-danger">*</span>
            </label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              rows={2}
              placeholder="Saran atau laporan lainnya..."
              className={inputClass('suggestions')}
            />
          </div>

          {/* Submit Button */}
          <div className="btn-wrapper w-full mt-6">
            <button type="submit" className="btn w-full py-4 text-lg font-semibold">
              <span className="btn-letter">A</span>
              <span className="btn-letter">b</span>
              <span className="btn-letter">s</span>
              <span className="btn-letter">e</span>
              <span className="btn-letter">n</span>
              <span className="btn-letter ml-1">S</span>
              <span className="btn-letter">e</span>
              <span className="btn-letter">k</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">r</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">n</span>
              <span className="btn-letter">g</span>
            </button>
          </div>
        </form>

        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-card p-6 max-w-sm w-full animate-pulse-slow">
              <div className="text-center">
                <div
                  className={`text-4xl mb-4 ${
                    popupStatus === 'success'
                      ? 'text-success neon-glow'
                      : popupStatus === 'warning'
                      ? 'text-warning'
                      : 'text-danger'
                  }`}
                >
                  {popupStatus === 'success' ? '✅' : popupStatus === 'warning' ? '⚠️' : '❌'}
                </div>
                <p className="text-gray-200 text-lg">{popupMessage}</p>
                <div className="btn-wrapper w-full mt-6">
                  <button onClick={() => setShowPopup(false)} className="btn w-full py-3">
                    <span className="btn-letter">O</span>
                    <span className="btn-letter">K</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
