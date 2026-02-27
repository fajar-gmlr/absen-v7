import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';

import type { 
  Employee, 
  AttendanceRecord, 
  Notification, 
  Note, 
  Holiday 
} from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeW5m1oRiipSiBmP8ZJ-tna1yNJJp_YlU",
  authDomain: "tdrsbs1.firebaseapp.com",
  projectId: "tdrsbs1",
  storageBucket: "tdrsbs1.firebasestorage.app",
  messagingSenderId: "121873519061",
  appId: "1:121873519061:web:55f403b4c75e17e9b7ed5c",
  measurementId: "G-ZL9W7KT1NF",
  databaseURL: "https://tdrsbs1-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
console.log('[Firebase] Initializing with database URL:', firebaseConfig.databaseURL);
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Monitor connection state
const connectedRef = ref(database, '.info/connected');
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log('[Firebase] Connection state: CONNECTED');
  } else {
    console.log('[Firebase] Connection state: DISCONNECTED');
  }
});



// Database references
const dbRef = {
  employees: ref(database, 'employees'),
  attendance: ref(database, 'attendance'),
  notifications: ref(database, 'notifications'),
  notes: ref(database, 'notes'),
  holidays: ref(database, 'holidays'),
};

// Employee operations
export const syncEmployees = (callback: (employees: Employee[]) => void) => {
  console.log('[Firebase] Starting employees sync...');
  return onValue(dbRef.employees, (snapshot) => {
    const data = snapshot.val();
    console.log('[Firebase] Employees data received:', data ? Object.keys(data).length : 0, 'employees');
    if (data) {
      const employees = Object.entries(data).map(([id, emp]: [string, any]) => ({
        ...emp,
        id
      }));
      callback(employees);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('[Firebase] Sync error (employees):', error);
  });
};


export const addEmployeeToDb = async (employee: Employee) => {
  try {
    console.log('[Firebase] Adding employee:', employee);
    const newRef = push(dbRef.employees);
    await set(newRef, employee);
    console.log('[Firebase] Employee added successfully:', newRef.key);
    return newRef.key;
  } catch (error) {
    console.error('[Firebase] Error adding employee:', error);
    throw error;
  }
};



export const updateEmployeeInDb = async (id: string, employee: Partial<Employee>) => {
  const empRef = ref(database, `employees/${id}`);
  await update(empRef, employee);
};

export const deleteEmployeeFromDb = async (id: string) => {
  const empRef = ref(database, `employees/${id}`);
  await remove(empRef);
};

// Attendance operations
export const syncAttendance = (callback: (records: AttendanceRecord[]) => void) => {
  return onValue(dbRef.attendance, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const records = Object.entries(data).map(([id, record]: [string, any]) => ({
        ...record,
        id
      }));
      callback(records);
    } else {
      callback([]);
    }
  });
};

export const addAttendanceToDb = async (record: AttendanceRecord) => {
  const newRef = push(dbRef.attendance);
  await set(newRef, record);
  return newRef.key;
};

// Notification operations
export const syncNotifications = (callback: (notifications: Notification[]) => void) => {
  return onValue(dbRef.notifications, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const notifications = Object.entries(data).map(([id, notif]: [string, any]) => ({
        ...notif,
        id
      }));
      callback(notifications);
    } else {
      callback([]);
    }
  });
};

export const addNotificationToDb = async (notification: Notification) => {
  const newRef = push(dbRef.notifications);
  await set(newRef, notification);
  return newRef.key;
};

export const updateNotificationInDb = async (id: string, notification: Partial<Notification>) => {
  const notifRef = ref(database, `notifications/${id}`);
  await update(notifRef, notification);
};

export const deleteNotificationFromDb = async (id: string) => {
  const notifRef = ref(database, `notifications/${id}`);
  await remove(notifRef);
};


// Note operations
export const syncNotes = (callback: (notes: Note[]) => void) => {
  return onValue(dbRef.notes, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const notes = Object.entries(data).map(([id, note]: [string, any]) => ({
        ...note,
        id
      }));
      callback(notes);
    } else {
      callback([]);
    }
  });
};

export const addNoteToDb = async (note: Note) => {
  const newRef = push(dbRef.notes);
  await set(newRef, note);
  return newRef.key;
};

export const updateNoteInDb = async (id: string, note: Partial<Note>) => {
  const noteRef = ref(database, `notes/${id}`);
  await update(noteRef, { ...note, updatedAt: new Date().toISOString() });
};

export const deleteNoteFromDb = async (id: string) => {
  const noteRef = ref(database, `notes/${id}`);
  await remove(noteRef);
};

// Holiday operations
export const syncHolidays = (callback: (holidays: Holiday[]) => void) => {
  return onValue(dbRef.holidays, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const holidays = Object.entries(data).map(([id, holiday]: [string, any]) => ({
        ...holiday,
        id
      }));
      callback(holidays);
    } else {
      callback([]);
    }
  });
};

export const addHolidayToDb = async (holiday: Holiday) => {
  const newRef = push(dbRef.holidays);
  await set(newRef, holiday);
  return newRef.key;
};

export const deleteHolidayFromDb = async (id: string) => {
  const holidayRef = ref(database, `holidays/${id}`);
  await remove(holidayRef);
};

export { database, dbRef };
