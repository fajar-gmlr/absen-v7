
import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useEmployees, useAddAttendance, useHasSubmittedToday } from '../store/useAppStore';
import { checkTimeGate, getTimestamp } from '../utils/timeUtils';
import type { AttendanceRecord, HealthCondition, AttendanceStatus } from '../types';

// ============================================
// CONSTANTS
// ============================================

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

// ============================================
// DEBOUNCED TEXTAREA COMPONENT
// ============================================

interface DebouncedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  label: string;
  fieldName: string;
  shakeFields: Set<string>;
}

const DEBOUNCE_DELAY = 300; // ms

function DebouncedTextarea({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  label,
  fieldName,
  shakeFields
}: DebouncedTextareaProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, DEBOUNCE_DELAY);
  }, [onChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        // Final sync on unmount
        if (localValue !== value) {
          onChange(localValue);
        }
      }
    };
  }, []);

  return (
    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
      <label className="block text-base font-medium text-white/70 mb-3">
        {label} <span className="text-red-400">*</span>
      </label>
      <textarea
        value={localValue}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base min-h-[100px] ${
          shakeFields.has(fieldName) ? 'border-red-500 shake' : ''
        }`}
      />
    </div>
  );
}

// Memoized version
const MemoizedDebouncedTextarea = memo(DebouncedTextarea);

// ============================================
// TEXT INPUT COMPONENT
// ============================================

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  fieldName: string;
  shakeFields: Set<string>;
}

function TextInput({ value, onChange, placeholder, label, fieldName, shakeFields }: TextInputProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
      <label className="block text-base font-medium text-white/70 mb-3">
        {label} <span className="text-red-400">*</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 outline-none text-base ${
          shakeFields.has(fieldName) ? 'border-red-500 shake' : ''
        }`}
      />
    </div>
  );
}

const MemoizedTextInput = memo(TextInput);

// ============================================
// EMPLOYEE SELECT COMPONENT
// ============================================

interface EmployeeSelectProps {
  value: string;
  onChange: (value: string) => void;
  employees: { id: string; initial: string; fullName: string }[];
  shakeFields: Set<string>;
}

function EmployeeSelect({ value, onChange, employees, shakeFields }: EmployeeSelectProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
      <label className="block text-base font-medium text-white/70 mb-3">
        Inisial - Nama Lengkap <span className="text-red-400">*</span>
      </label>
      <select
        value={value}
        onChange={handleChange}
        className={`w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white focus:border-cyan-500 outline-none text-base ${
          shakeFields.has('employee') ? 'border-red-500 shake' : ''
        }`}
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
  );
}

const MemoizedEmployeeSelect = memo(EmployeeSelect);

// ============================================
// WORK LOCATION SELECT COMPONENT
// ============================================

interface WorkLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  shakeFields: Set<string>;
}

function WorkLocationSelect({ value, onChange, shakeFields }: WorkLocationSelectProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
      <label className="block text-base font-medium text-white/70 mb-3">
        Lokasi Kerja <span className="text-red-400">*</span>
      </label>
      <select
        value={value}
        onChange={handleChange}
        className={`w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white focus:border-cyan-500 outline-none text-base ${
          shakeFields.has('workLocation') ? 'border-red-500 shake' : ''
        }`}
      >
        <option value="" className="text-gray-900">Pilih Lokasi</option>
        {WORK_LOCATIONS.map((loc) => (
          <option key={loc} value={loc} className="text-gray-900">
            {loc}
          </option>
        ))}
      </select>
    </div>
  );
}

const MemoizedWorkLocationSelect = memo(WorkLocationSelect);

// ============================================
// HEALTH CONDITION RADIO COMPONENT
// ============================================

interface HealthConditionRadioProps {
  value: HealthCondition;
  onChange: (value: HealthCondition) => void;
  shakeFields: Set<string>;
}

function HealthConditionRadio({ value, onChange, shakeFields }: HealthConditionRadioProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value as HealthCondition);
  }, [onChange]);

  return (
    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
      <label className="block text-base font-medium text-white/70 mb-4">
        Kondisi Kesehatan <span className="text-red-400">*</span>
      </label>
      <div className="space-y-3">
        {HEALTH_CONDITIONS.map((condition) => (
          <label
            key={condition.value}
            className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
              shakeFields.has('healthCondition')
                ? 'border border-red-500 bg-red-500/10 shake'
                : value === condition.value
                ? 'border border-cyan-500/50 bg-cyan-500/10'
                : 'border border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <input
              type="radio"
              name="healthCondition"
              value={condition.value}
              checked={value === condition.value}
              onChange={handleChange}
              className="w-5 h-5 text-cyan-500 bg-black border-white/20 focus:ring-cyan-500"
            />
            <span className="ml-4 text-base text-white">{condition.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const MemoizedHealthConditionRadio = memo(HealthConditionRadio);

// ============================================
// POPUP MODAL COMPONENT
// ============================================

interface PopupModalProps {
  show: boolean;
  message: string;
  status: 'success' | 'error' | 'warning';
  onClose: () => void;
}

function PopupModal({ show, message, status, onClose }: PopupModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 border border-white/10 p-8 rounded-2xl max-w-md w-full">
        <div className="text-center">
          <div
            className={`text-5xl mb-5 ${
              status === 'success'
                ? 'text-green-400'
                : status === 'warning'
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌'}
          </div>
          <p className="text-white text-lg mb-6">{message}</p>
          <button 
            onClick={onClose} 
            className="w-full py-4 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-400 text-base font-bold hover:bg-cyan-500/30 transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

const MemoizedPopupModal = memo(PopupModal);

// ============================================
// MAIN ABSENSI COMPONENT
// ============================================

export function Absensi() {
  // Use optimized selectors to prevent re-renders from unrelated store data
  const employees = useEmployees();
  const addAttendance = useAddAttendance();
  
  // Local state for form
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

  // Memoized validation function
  const validateForm = useCallback((): boolean => {
    const requiredFields = [
      { key: 'employee', value: selectedEmployee },
      { key: 'workLocation', value: workLocation },
      { key: 'healthCondition', value: healthCondition },
      { key: 'yesterdayWork', value: yesterdayWork },
      { key: 'todayWork', value: todayWork },
      { key: 'tomorrowAgenda', value: tomorrowAgenda },
      { key: 'suggestions', value: suggestions },
    ];

    if (workLocation === 'Lainnya') {
      requiredFields.push({ key: 'customWorkLocation', value: customWorkLocation });
    }

    const emptyFields = requiredFields.filter(f => !f.value || (typeof f.value === 'string' && !f.value.trim()));
    
    if (emptyFields.length > 0) {
      setShakeFields(new Set(emptyFields.map(f => f.key)));
      setTimeout(() => setShakeFields(new Set()), 500);
      return false;
    }

    return true;
  }, [selectedEmployee, workLocation, healthCondition, yesterdayWork, todayWork, tomorrowAgenda, suggestions, customWorkLocation]);

  // Check if already submitted today using optimized selector
  const hasSubmittedToday = useHasSubmittedToday(selectedEmployee);

  // Memoized submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const timeGate = checkTimeGate();
    
    if (!timeGate.allowed) {
      setPopupStatus('error');
      setPopupMessage(timeGate.message);
      setShowPopup(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (selectedEmployee && hasSubmittedToday) {
      setPopupStatus('warning');
      setPopupMessage('Anda sudah absen hari ini!');
      setShowPopup(true);
      return;
    }

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
  }, [validateForm, selectedEmployee, hasSubmittedToday, employees, addAttendance, workLocation, customWorkLocation, healthCondition, yesterdayWork, todayWork, tomorrowAgenda, suggestions]);

  // Memoized close popup handler
  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  // Work location change handler (clears custom location if not "Lainnya")
  const handleWorkLocationChange = useCallback((value: string) => {
    setWorkLocation(value);
    if (value !== 'Lainnya') {
      setCustomWorkLocation('');
    }
  }, []);

  // Memoized shake fields for sub-components
  const shakeFieldsMemo = useMemo(() => shakeFields, [shakeFields]);

  return (
    <Layout title="Absensi Harian">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Employee Selection */}
          <MemoizedEmployeeSelect
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            employees={employees}
            shakeFields={shakeFieldsMemo}
          />

          {/* Work Location */}
          <MemoizedWorkLocationSelect
            value={workLocation}
            onChange={handleWorkLocationChange}
            shakeFields={shakeFieldsMemo}
          />

          {/* Custom Work Location (conditional) */}
          {workLocation === 'Lainnya' && (
            <MemoizedTextInput
              value={customWorkLocation}
              onChange={setCustomWorkLocation}
              placeholder="Masukkan lokasi kerja"
              label="Lokasi Kerja Lainnya"
              fieldName="customWorkLocation"
              shakeFields={shakeFieldsMemo}
            />
          )}

          {/* Health Condition */}
          <MemoizedHealthConditionRadio
            value={healthCondition}
            onChange={setHealthCondition}
            shakeFields={shakeFieldsMemo}
          />

          {/* Yesterday Work - Debounced */}
          <MemoizedDebouncedTextarea
            value={yesterdayWork}
            onChange={setYesterdayWork}
            placeholder="Apa pekerjaan yang telah diselesaikan?"
            label="Laporan pekerjaan hari sebelumnya"
            fieldName="yesterdayWork"
            shakeFields={shakeFieldsMemo}
          />

          {/* Today Work - Debounced */}
          <MemoizedDebouncedTextarea
            value={todayWork}
            onChange={setTodayWork}
            placeholder="Apa rencana pekerjaan hari ini?"
            label="Pekerjaan hari ini"
            fieldName="todayWork"
            shakeFields={shakeFieldsMemo}
          />

          {/* Tomorrow Agenda - Debounced */}
          <MemoizedDebouncedTextarea
            value={tomorrowAgenda}
            onChange={setTomorrowAgenda}
            placeholder="Apa rencana pekerjaan untuk besok?"
            label="Agenda besok"
            fieldName="tomorrowAgenda"
            rows={2}
            shakeFields={shakeFieldsMemo}
          />

          {/* Suggestions - Debounced */}
          <MemoizedDebouncedTextarea
            value={suggestions}
            onChange={setSuggestions}
            placeholder="Saran atau laporan lainnya..."
            label="Saran dan/atau Laporan"
            fieldName="suggestions"
            rows={2}
            shakeFields={shakeFieldsMemo}
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full py-5 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-400 text-lg font-bold hover:bg-cyan-500/30 transition-all shadow-lg"
          >
            Absen Sekarang
          </button>
        </form>

        {/* Popup Modal */}
        <MemoizedPopupModal
          show={showPopup}
          message={popupMessage}
          status={popupStatus}
          onClose={handleClosePopup}
        />
      </div>
    </Layout>
  );
}

