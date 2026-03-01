// Employee Types
export type UserRole = 'manager' | 'employee';

export interface Employee {
  id: string;
  initial: string;
  fullName: string;
  role: UserRole;
  jabatan?: string;
  emergencyContact?: EmergencyContact;
  mcuDate?: string;
  safetyCertificates: SafetyCertificate[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface SafetyCertificate {
  id: string;
  name: string;
  expirationDate: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeInitial: string;
  employeeName: string;
  workLocation: string;
  customWorkLocation?: string | null;
  healthCondition: HealthCondition;
  yesterdayWork: string;
  todayWork: string;
  tomorrowAgenda: string;
  suggestions: string;
  timestamp: string;
  status: AttendanceStatus;
}

export type HealthCondition = 
  | 'healthy-no-symptoms'
  | 'has-symptoms-not-checked'
  | 'sick-checked-medical';

export type AttendanceStatus = 
  | 'normal'
  | 'late'
  | 'pending';

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  acknowledgedBy: string[];
}

// Toolbox Types
export interface UnitConversion {
  category: UnitCategory;
  fromValue: number;
  fromUnit: string;
  toValue: number;
  toUnit: string;
}

export type UnitCategory = 
  | 'length'
  | 'volume'
  | 'weight'
  | 'flowrate'
  | 'temperature'
  | 'pressure'
  | 'density';

export interface LinearInterpolation {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  targetX?: number;
  targetY?: number;
  result?: number;
}

export interface WaterdrawDisplacer {
  nominalDiameter: number;
  nominalDiameterUnit: 'inch' | 'mm';
  wallThickness: number;
  wallThicknessUnit: 'inch' | 'mm';
  value: number;
  valueUnit: 'mm' | '%';
}

export interface WaterdrawMasterVsBejana {
  // Section 1: Specification
  masterKFactor: number;
  bejanaNominalVolume: number;
  bejanaCorrectedNominal: number;
  bejanaMainScale: number;
  bejanaCorrectedScale: number;
  thermalCoefficient: number;
  
  // Section 2: Field Data (5 runs)
  calibrationRuns: CalibrationRun[];
}

export interface CalibrationRun {
  pulse: number;
  pressure: number;
  reading: number;
  temperature: number;
  // Calculated fields
  cpl?: number;
  ctl?: number;
  masterVolume?: number;
  readingVolume?: number;
  realVolumeBejana?: number;
  meterFactor?: number;
}

export interface APICalculation {
  tableType: 54 | 6;
  apiGravity?: number;
  density15?: number;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  pressure: number;
  equilibriumPressure?: boolean;
  roundingApi1121?: boolean;
  // Results
  cpl?: number;
  ctl?: number;
  vcf?: number;
}

// Notepad Types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Holiday Types
export interface Holiday {
  id: string;
  date: string;          // Start date (for backward compatibility)
  endDate?: string;      // End date for multi-day holidays (optional)
  name: string;
  isCustom: boolean;
  isMultiDay?: boolean;  // Flag to indicate if this is a multi-day holiday
}
