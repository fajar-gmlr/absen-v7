# TODO: Add Jabatan (Position/Title) for Karyawan

## Information Gathered:
- **UserRole** type in `src/types/index.ts`: Currently `'manager' | 'employee'`
- **Employee** interface in `src/types/index.ts`: Contains id, initial, fullName, role, emergencyContact, mcuDate, safetyCertificates
- **ManajemenKaryawan.tsx**: Employee management form with initial, fullName, emergency contact, MCU date, certificates
- **Absensi.tsx**: Employee dropdown shows "initial - fullName"

## Plan:

### 1. Update `src/types/index.ts`
- [ ] Add `jabatan` (optional string) field to the `Employee` interface

### 2. Update `src/pages/managerial/ManajemenKaryawan.tsx`
- [ ] Add state for `jabatan`
- [ ] Add input field for Jabatan in the employee form
- [ ] Include Jabatan in the employee data when submitting (add to employeeData object)
- [ ] Display Jabatan in the employee list card
- [ ] Pre-fill Jabatan when editing an employee

## Dependent Files:
- `src/types/index.ts` - Core type definition
- `src/pages/managerial/ManajemenKaryawan.tsx` - Employee management UI

## Followup steps:
- No additional installations required
- Test by adding/editing employees with Jabatan
