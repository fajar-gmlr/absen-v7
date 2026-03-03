# Performance Optimization TODO

## Phase 1: CSS Optimizations (index.css) ✅ COMPLETED
- [x] 1.1 Add GPU-accelerated shake animation with `will-change: transform`
- [x] 1.2 Add mobile media query to reduce/disable backdrop-filter
- [x] 1.3 Add transform: translateZ(0) for GPU layer promotion on cards

## Phase 2: Zustand Store Optimizations (useAppStore.ts) ✅ COMPLETED
- [x] 2.1 Create specific selectors for Absensi page (employees, attendanceRecords)
- [x] 2.2 Optimize hasSubmittedToday to use memoization/caching

## Phase 3: Component Refactoring (Absensi.tsx) ✅ COMPLETED
- [x] 3.1 Create memoized EmployeeSelect component
- [x] 3.2 Create memoized WorkLocationSelect component  
- [x] 3.3 Create memoized HealthConditionRadio component
- [x] 3.4 Create DebouncedTextarea component for long text fields
- [x] 3.5 Create memoized TextInput component
- [x] 3.6 Create memoized PopupModal component
- [x] 3.7 Refactor main Absensi to use selectors + sub-components
- [x] 3.8 Use shallow comparison for store access

## Phase 4: Notifikasi Page Enhancement ✅ COMPLETED
- [x] 4.1 Add employee dropdown to pull from employee list
- [x] 4.2 Create memoized NotificationForm component
- [x] 4.3 Create memoized NotificationItem component
- [x] 4.4 Use optimized selectors for employees

