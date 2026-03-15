import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useAllAttendance,
  useEmployees,
  useHolidays,
} from "../../hooks/useQueries";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthlyAttendance() {
  const now = new Date();
  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [year, setYear] = useState(String(now.getFullYear()));

  const { data: employees, isLoading: empLoading } = useEmployees();
  const { data: allAttendance, isLoading: attLoading } = useAllAttendance();
  const { data: holidays } = useHolidays();

  const daysInMonth = new Date(
    Number.parseInt(year),
    Number.parseInt(month),
    0,
  ).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const holidaySet = useMemo(() => {
    const s = new Set<string>();
    if (holidays) {
      for (const h of holidays) {
        if (h.date.startsWith(`${year}-${month}`)) s.add(h.date);
      }
    }
    return s;
  }, [holidays, year, month]);

  const attendanceMap = useMemo(() => {
    const m: Record<string, Record<string, string>> = {};
    if (allAttendance) {
      for (const rec of allAttendance) {
        if (!rec.date.startsWith(`${year}-${month}`)) continue;
        if (!m[rec.employeeId]) m[rec.employeeId] = {};
        m[rec.employeeId][rec.date] = rec.status;
      }
    }
    return m;
  }, [allAttendance, year, month]);

  const years = Array.from({ length: 5 }, (_, i) =>
    String(now.getFullYear() - 2 + i),
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-primary" />
          Monthly Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          View attendance grid for all employees.
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex gap-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger
              data-ocid="monthly-att.month.select"
              className="w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger data-ocid="monthly-att.year.select" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {empLoading || attLoading ? (
        <div data-ocid="monthly-att.table.loading_state" className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !employees?.length ? (
        <div
          data-ocid="monthly-att.table.empty_state"
          className="py-16 text-center text-muted-foreground"
        >
          No employees registered.
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              {MONTHS[Number.parseInt(month) - 1]} {year}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-card min-w-32">
                    Employee
                  </th>
                  {days.map((d) => {
                    const dateStr = `${year}-${month}-${String(d).padStart(2, "0")}`;
                    const isHoliday = holidaySet.has(dateStr);
                    return (
                      <th
                        key={d}
                        className={`p-1.5 text-center w-8 font-medium ${isHoliday ? "text-holiday" : "text-muted-foreground"}`}
                      >
                        {d}
                      </th>
                    );
                  })}
                  <th className="p-3 text-center font-medium text-muted-foreground">
                    Present
                  </th>
                  <th className="p-3 text-center font-medium text-muted-foreground">
                    Absent
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, empIdx) => {
                  const empAtt = attendanceMap[emp.employeeId] ?? {};
                  let presentCount = 0;
                  let absentCount = 0;

                  return (
                    <tr
                      key={emp.id}
                      data-ocid={`monthly-att.row.${empIdx + 1}`}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 sticky left-0 bg-card font-medium">
                        <div>{emp.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {emp.employeeId}
                        </div>
                      </td>
                      {days.map((d) => {
                        const dateStr = `${year}-${month}-${String(d).padStart(2, "0")}`;
                        const status = empAtt[dateStr];
                        const isHoliday = holidaySet.has(dateStr);

                        if (status === "present") presentCount++;
                        else if (status === "absent") absentCount++;

                        return (
                          <td key={d} className="p-1 text-center">
                            {isHoliday && !status ? (
                              <span className="text-holiday font-bold">H</span>
                            ) : status === "present" ? (
                              <span className="text-success font-bold">P</span>
                            ) : status === "absent" ? (
                              <span className="text-absent font-bold">A</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        <Badge className="bg-success-bg text-success-foreground">
                          {presentCount}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="destructive"
                          className="bg-absent-bg text-absent"
                        >
                          {absentCount}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
