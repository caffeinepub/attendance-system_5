# AI Face Attendance System — Professional Upgrade

## Current State
A React + Motoko attendance management app with 4 pages:
- **Summary**: Daily stat cards (present/late/absent counts) + employee lists per status + CSV export
- **Check-In**: Employee select dropdown + status select + camera capture + submit
- **Log**: Date-filtered attendance table with delete + CSV export
- **Admin**: Employee registration (webcam/upload) + employee table with delete
- Navbar with 4 links + mobile hamburger
- OKLCH design system, Bricolage Grotesque display font, Plus Jakarta Sans body

## Requested Changes (Diff)

### Add
- **Dark mode toggle** in Navbar (sun/moon icon button); persist preference in localStorage; apply `dark` class to `<html>`; add dark mode CSS variables to index.css
- **Live clock widget** on Check-In page: large time display (HH:MM:SS) updating every second, date line below it — shown above the form
- **Clock-Out option** on Check-In page: add "Clock-Out" as a third status option alongside Present/Late
- **Visual donut chart** on Summary page: using inline SVG or a lightweight canvas approach showing present/late/absent proportions — placed below the stat cards
- **Animated number counters** on Summary stat cards: numbers count up from 0 on load/date change
- **Search input** on Admin page: filter employee table rows by name or department in real-time
- **Attendance column** on Admin employee table: show "X days" count for each employee fetched from getAllAttendanceRecords (compute client-side)
- **Department filter dropdown** on Log page: filter records by department in addition to date
- **Search input** on Log page: filter records by employee name
- **PDF export** on Log page: client-side PDF generation using browser print API (window.print) or jsPDF-style using canvas — export current filtered view
- **"Today's Snapshot" hero banner** on Summary page: full-width colored bar at the top showing today's date, total employee count, and attendance rate %

### Modify
- **Navbar**: Add dark mode toggle button (right side, before mobile menu button); add `dark:` variants to all Navbar classes
- **index.css**: Add dark mode token block under `.dark` selector with appropriate dark OKLCH values
- **SummaryPage**: Replace plain number display with animated counters; add donut chart; add hero snapshot banner
- **CheckInPage**: Add live clock above the form card; add clock-out status option
- **AdminPage**: Add search input above employee table; add "Attendance" column; load all attendance records and compute per-employee day count
- **LogPage**: Add search + department filter controls alongside date picker; add PDF export button

### Remove
- Nothing removed

## Implementation Plan
1. Update `index.css` with dark mode CSS variable block
2. Update `tailwind.config.js` to ensure `darkMode: 'class'` (already set)
3. Update `Navbar.tsx`: add dark mode toggle with localStorage persistence, `dark:` class variants
4. Create `src/frontend/src/hooks/useDarkMode.ts`: hook managing dark class on `<html>` + localStorage
5. Create `src/frontend/src/components/LiveClock.tsx`: updates every second, shows HH:MM:SS + date
6. Create `src/frontend/src/components/DonutChart.tsx`: inline SVG donut chart with legend
7. Create `src/frontend/src/components/AnimatedCounter.tsx`: count-up animation hook + display
8. Update `SummaryPage.tsx`: add hero banner, animated counters, DonutChart
9. Update `CheckInPage.tsx`: add LiveClock, add clock-out to status options
10. Update `AdminPage.tsx`: add search state + filter logic, add attendance count column using useAllAttendance
11. Add `useAllAttendance` to `useQueries.ts`
12. Update `LogPage.tsx`: add search + department filter states + PDF export
13. Validate (lint + typecheck + build)
