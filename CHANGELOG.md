# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Full-screen notification modal on app startup for unacknowledged notifications
  - Shows ALL unacknowledged notifications in queue (one by one)
  - User must click "Saya Sudah Membaca" to acknowledge each notification
  - Modal persists until all notifications are acknowledged
  - Shows progress indicator (e.g., "1 dari 3 pengumuman")
  - Lists all pending notifications with status indicators
  - Prevents users from ignoring important announcements
  - Toast notifications still appear for new notifications after initial load

### Changed
- Added Date Picker functionality in Harian Tab. Records no longer fallback to just strictly computer's `new Date()`. Instead, managers can arbitrarily pick any history date in daily metrics.
- Fixed holiday form to allow adding multiple holidays in one session (form stays open after adding)
- Fixed single-day holiday storage issue - removed undefined endDate property (Firebase doesn't allow undefined values)
- Added comprehensive logging for holiday operations to debug storage issues
- Fixed `AnalisaKehadiran` typescript and logic errors
  - Fixed logic for "Tidak Absen" in monthly statistics by ignoring weekends properly instead of mathematical substraction (`calculateAbsentDays`).
  - Added strict TS typing for variables like `stat`, `row`, `h`, `r` in `exportToExcel`, `filter` arrays to avoid implicit any errors.
  - Formatted `ISOSting` conversion correctly depending on local timezone offset with local string.
- Enhanced AnalisaKehadiran (Attendance Analysis) with improved logic:
  - Added `getAttendanceStatus` function to determine attendance status based on timestamp:
    - 05:00 - 10:00 → 'ontime' (Tepat waktu)
    - 10:01 - 17:00 → 'late' (Telat)
    - < 05:00 or > 17:00 → 'invalid' (Tidak Absen/Ditolak)
  - Daily records now filter only valid timestamps (not more than 17:00)
  - Monthly statistics now:
    - Filters valid attendance records only (excludes invalid timestamps)
    - Prevents duplicate attendance on same day using unique date sets
    - Accurate "Tidak Absen" calculation based on passed business days
    - Different logic for current month (up to today), past months, and future months
  - "Belum Absen" section now includes employees with invalid timestamps
  - Refactored into modular components (under 500 lines total):
    - `ConnectionStatusBar.tsx` - Firebase connection status and refresh
    - `DailyView.tsx` - Daily attendance display
    - `MonthlyView.tsx` - Monthly statistics and holiday management

### Security
- Moved Firebase API key from hardcoded config to environment variables
  - Created `.env.example` template file for documentation
  - Updated `src/firebase/config.ts` to use `import.meta.env`
  - Added `.env` to `.gitignore` to prevent accidental commits
  - Updated `DEPLOYMENT_GUIDE.md` with environment variables setup instructions
  - **IMPORTANT**: Existing `.env` file contains the API key and is NOT tracked in git

## [0.0.9] - 2025-01-09

### Fixed
- Fixed all undefined `.length` errors in Pergerakan and Notifikasi pages
- Added optional chaining (`?.`) for `acknowledgedBy` array access
- Fixed filter operation to handle undefined arrays safely

## [0.0.8] - 2025-01-09

### Fixed
- Fixed Firebase sync issues with undefined values in employee data
- Fixed safetyCertificates null check to prevent undefined.length crash
- Fixed async operations in Pergerakan and Notifikasi for Firebase sync
- Changed employee data construction to avoid undefined values (Firebase doesn't allow undefined)

## [0.0.7] - 2025-01-09

### Added
- Firebase Realtime Database integration for cross-device synchronization
- Real-time sync for employees, attendance, notifications, notes, and holidays
- Error boundary component for better error handling
- Loading states during Firebase operations

### Changed
- Migrated from localStorage to Firebase Realtime Database
- Updated all store operations to use async/await for Firebase
- Added proper error handling for network failures

## [0.0.6] - 2025-01-09

### Fixed
- Fixed Managerial page PIN entry screen rendering issue
- Corrected button text display in PIN entry form

## [0.0.5] - 2025-01-09

### Added
- Managerial page with PIN protection (PIN: 7777)
- Employee management (add, edit, delete)
- Attendance analysis with charts
- Notification/announcement system with read receipts
- Safety certificate tracking with expiration alerts
- MCU (Medical Check Up) date tracking
- Emergency contact information for employees

### Changed
- Updated navigation structure with nested routes for managerial features
- Enhanced UI with 3D card effects and animations

## [0.0.4] - 2025-01-09

### Added
- Notepad page for quick notes
- Notification page for announcements
- Toolbox page with calculator and unit converter
- Tutup (closing) page for end-of-day operations

### Changed
- Improved responsive design for mobile devices
- Added touch-friendly button sizes (min 44px)

## [0.0.3] - 2025-01-09

### Added
- Attendance submission with location tracking
- Photo capture for attendance proof
- Real-time clock display
- Holiday management

### Changed
- Enhanced form validation
- Improved error messages

## [0.0.2] - 2025-01-09

### Added
- Basic layout component
- Navigation between pages
- Zustand store for state management
- Local storage persistence

## [0.0.1] - 2025-01-09

### Added
- Initial project setup with React + Vite + TypeScript
- Tailwind CSS for styling
- Basic routing with React Router
- PWA configuration
