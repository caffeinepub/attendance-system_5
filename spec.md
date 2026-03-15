# PAVITHRA EXPLOSIVES Attendance System

## Current State
Employee dashboard shows all-time attendance and salary data without filtering. Stats (days present/absent, monthly salary, per-day salary) are computed across all records.

## Requested Changes (Diff)

### Add
- Month/year picker (calendar filter) on employee dashboard
- Filter attendance records by selected month
- Recalculate days present, days absent, and earned salary for the selected month
- Earned salary = days present × daily salary (for that month)
- Show month-filtered attendance table and salary summary

### Modify
- EmployeeDashboard: add month selector, filter attendance by month, recompute stats per month

### Remove
- Nothing removed

## Implementation Plan
1. Add month/year selector (dropdowns or native month input) at top of dashboard
2. Filter attendance records to the selected month
3. Stats cards: days present, days absent, earned salary (daysPresent × dailySalary), monthly salary (dailySalary × 26)
4. Attendance table shows only records for selected month
5. Default to current month
