import { create } from 'zustand';
import type { 
  Employee, 
  AttendanceRecord, 
  Notification, 
  Note, 
  Holiday 
} from '../types';
import {
  syncEmployees,
  addEmployeeToDb,
  updateEmployeeInDb,
  deleteEmployeeFromDb,
  syncAttendance,
  addAttendanceToDb,
  syncNotifications,
  addNotificationToDb,
  updateNotificationInDb,
  deleteNotificationFromDb,
  syncNotes,
  addNoteToDb,
  updateNoteInDb,
  deleteNoteFromDb,
  syncHolidays,
  addHolidayToDb,
  deleteHolidayFromDb,
} from '../firebase/config';
import type { Unsubscribe } from 'firebase/database';

// Global array to track Firebase subscriptions
let firebaseUnsubscribers: Unsubscribe[] = [];

interface AppState {
  // User state
  userName: string | null;
  setUserName: (name: string) => void;
  
  // Employees
  employees: Employee[];
  addEmployee: (employee: Employee) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  // Attendance
  attendanceRecords: AttendanceRecord[];
  addAttendance: (record: AttendanceRecord) => Promise<void>;
  hasSubmittedToday: (employeeId: string) => boolean;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => Promise<void>;
  acknowledgeNotification: (notificationId: string, userName: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Notes
  notes: Note[];
  addNote: (note: Note) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Holidays
  holidays: Holiday[];
  addHoliday: (holiday: Holiday) => Promise<void>;
  deleteHoliday: (id: string) => Promise<void>;
  
  // Managerial access
  isManagerMode: boolean;
  setManagerMode: (enabled: boolean) => void;
  
  // Firebase sync cleanup
  cleanup: () => void;
}

export const useAppStore = create<AppState>()((set, get) => {
  return {
    // User state
    userName: null,
    setUserName: (name) => set({ userName: name }),
    
    // Employees
    employees: [],
    addEmployee: async (employee) => {
      console.log('[Store] Adding employee:', employee);
      await addEmployeeToDb(employee);
    },
    updateEmployee: async (id, employee) => {
      console.log('[Store] Updating employee:', id, employee);
      await updateEmployeeInDb(id, employee);
    },
    deleteEmployee: async (id) => {
      console.log('[Store] Deleting employee:', id);
      await deleteEmployeeFromDb(id);
    },
    
    // Attendance
    attendanceRecords: [],
    addAttendance: async (record) => {
      console.log('[Store] Adding attendance:', record);
      await addAttendanceToDb(record);
    },
    hasSubmittedToday: (employeeId) => {
      const today = new Date().toISOString().split('T')[0];
      return get().attendanceRecords.some(
        (record) => record.employeeId === employeeId && record.timestamp.startsWith(today)
      );
    },
    
    // Notifications
    notifications: [],
    addNotification: async (notification) => {
      console.log('[Store] Adding notification:', notification);
      await addNotificationToDb(notification);
    },
    acknowledgeNotification: async (notificationId, userName) => {
      console.log('[Store] Acknowledging notification:', notificationId, userName);
      const notification = get().notifications.find(n => n.id === notificationId);
      if (notification) {
        const currentAcknowledgedBy = notification.acknowledgedBy || [];
        if (!currentAcknowledgedBy.includes(userName)) {
          const updatedAcknowledgedBy = [...currentAcknowledgedBy, userName];
          await updateNotificationInDb(notificationId, { acknowledgedBy: updatedAcknowledgedBy });
        }
      }
    },
    deleteNotification: async (id) => {
      console.log('[Store] Deleting notification:', id);
      await deleteNotificationFromDb(id);
    },
    
    // Notes
    notes: [],
    addNote: async (note) => {
      console.log('[Store] Adding note:', note);
      await addNoteToDb(note);
    },
    updateNote: async (id, updates) => {
      console.log('[Store] Updating note:', id, updates);
      await updateNoteInDb(id, updates);
    },
    deleteNote: async (id) => {
      console.log('[Store] Deleting note:', id);
      await deleteNoteFromDb(id);
    },
    
    // Holidays
    holidays: [],
    addHoliday: async (holiday) => {
      console.log('[Store] Adding holiday:', JSON.stringify(holiday));
      try {
        await addHolidayToDb(holiday);
        console.log('[Store] Holiday added successfully');
      } catch (error) {
        console.error('[Store] Error adding holiday:', error);
        throw error;
      }
    },
    deleteHoliday: async (id) => {
      console.log('[Store] Deleting holiday:', id);
      await deleteHolidayFromDb(id);
    },
    
    // Managerial access
    isManagerMode: false,
    setManagerMode: (enabled) => set({ isManagerMode: enabled }),
    
    // Cleanup function
    cleanup: () => {
      console.log('[Store] Cleaning up Firebase subscriptions');
      firebaseUnsubscribers.forEach(unsub => unsub());
      firebaseUnsubscribers = [];
    },
  };
});

// Initialize Firebase sync
export const initializeFirebaseSync = () => {
  console.log('[Store] Initializing Firebase sync...');
  
  // Clean up existing subscriptions first
  firebaseUnsubscribers.forEach(unsub => unsub());
  firebaseUnsubscribers = [];
  
  // Sync employees
  console.log('[Store] Setting up employees sync...');
  const unsubEmployees = syncEmployees((employees) => {
    console.log('[Store] Employees updated from Firebase:', employees.length, 'employees');
    useAppStore.setState({ employees });
  });
  firebaseUnsubscribers.push(unsubEmployees);
  
  // Sync attendance
  console.log('[Store] Setting up attendance sync...');
  const unsubAttendance = syncAttendance((records) => {
    console.log('[Store] Attendance updated from Firebase:', records.length, 'records');
    useAppStore.setState({ attendanceRecords: records });
  });
  firebaseUnsubscribers.push(unsubAttendance);
  
  // Sync notifications
  console.log('[Store] Setting up notifications sync...');
  const unsubNotifications = syncNotifications((notifications) => {
    console.log('[Store] Notifications updated from Firebase:', notifications.length, 'notifications');
    useAppStore.setState({ notifications });
  });
  firebaseUnsubscribers.push(unsubNotifications);
  
  // Sync notes
  console.log('[Store] Setting up notes sync...');
  const unsubNotes = syncNotes((notes) => {
    console.log('[Store] Notes updated from Firebase:', notes.length, 'notes');
    useAppStore.setState({ notes });
  });
  firebaseUnsubscribers.push(unsubNotes);
  
  // Sync holidays
  console.log('[Store] Setting up holidays sync...');
  const unsubHolidays = syncHolidays((holidays) => {
    console.log('[Store] Holidays updated from Firebase:', holidays.length, 'holidays');
    useAppStore.setState({ holidays });
  });
  firebaseUnsubscribers.push(unsubHolidays);
  
  console.log('[Store] Firebase sync initialized with', firebaseUnsubscribers.length, 'listeners');
  
  // Return cleanup function
  return () => {
    console.log('[Store] Cleaning up all Firebase subscriptions');
    firebaseUnsubscribers.forEach(unsub => unsub());
    firebaseUnsubscribers = [];
  };
};
