# Changelog

All notable changes to this project will be documented in this file.

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
