# TODO: Fix Kehadiran Database Connection & Add Multi-Day Holiday Feature

## Phase 1: Create Git Checkpoint
- [ ] Create git commit to save current working state

## Phase 2: Diagnose & Fix Database Connection
- [ ] Add comprehensive logging to `src/firebase/config.ts`
- [ ] Add connection status tracking to `src/store/useAppStore.ts`
- [ ] Add refresh button and connection status to `src/pages/managerial/AnalisaKehadiran.tsx`
- [ ] Add error boundaries for better error handling

## Phase 3: Add Multi-Day Holiday Feature
- [ ] Update `Holiday` type in `src/types/index.ts` to support date ranges
- [ ] Modify holiday form in `AnalisaKehadiran.tsx` to support:
  - Single day selection (current)
  - Date range selection (start date - end date)
- [ ] Update `addHoliday` logic to handle multiple days
- [ ] Update holiday display to show date ranges

## Phase 4: Test & Verify
- [ ] Test Firebase connection and data retrieval
- [ ] Verify kehadiran data displays correctly
- [ ] Test single day holiday creation
- [ ] Test multi-day holiday creation
- [ ] Verify holiday calculations in monthly stats
