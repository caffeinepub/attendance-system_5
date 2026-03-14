import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  Clock,
  Download,
  TrendingUp,
  UserX,
  Users,
} from "lucide-react";
import { useState } from "react";
import AnimatedCounter from "../components/AnimatedCounter";
import DonutChart from "../components/DonutChart";
import StatusBadge from "../components/StatusBadge";
import {
  todayString,
  useAttendanceByDate,
  useDailySummary,
  useEmployees,
} from "../hooks/useQueries";

const DONUT_COLORS = {
  present: "oklch(0.62 0.18 145)",
  late: "oklch(0.72 0.17 65)",
  absent: "oklch(0.55 0.22 25)",
};

export default function SummaryPage() {
  const [date, setDate] = useState(todayString());
  const { data: summary, isLoading: summaryLoading } = useDailySummary(date);
  const { data: records, isLoading: recordsLoading } =
    useAttendanceByDate(date);
  const { data: employees } = useEmployees();

  const presentCount = summary ? Number(summary.presentCount) : 0;
  const lateCount = summary ? Number(summary.lateCount) : 0;
  const absentEmployees = summary?.absentEmployees ?? [];
  const absentCount = absentEmployees.length;
  const totalEmployees = employees?.length ?? 0;
  const attendanceRate =
    totalEmployees > 0
      ? Math.round(((presentCount + lateCount) / totalEmployees) * 100)
      : 0;

  const presentEmployees =
    records?.filter((r) => r.status === "present").map((r) => r.employeeName) ??
    [];
  const lateEmployees =
    records?.filter((r) => r.status === "late").map((r) => r.employeeName) ??
    [];

  const handleExportCSV = () => {
    const rows = [
      ["Employee Name", "Status"],
      ...presentEmployees.map((n) => [n, "Present"]),
      ...lateEmployees.map((n) => [n, "Late"]),
      ...absentEmployees.map((n) => [n, "Absent"]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-summary-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = summaryLoading || recordsLoading;

  const displayDate = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      {/* Date picker row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Daily Summary
          </h1>
          <p className="text-muted-foreground mt-1">
            Attendance overview for the selected date
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              data-ocid="summary.date_input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9 w-44"
            />
          </div>
          <Button
            data-ocid="summary.export_button"
            variant="outline"
            onClick={handleExportCSV}
            className="shrink-0"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Hero banner */}
      <div
        data-ocid="summary.hero_card"
        className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 dark:from-primary/25 dark:via-primary/15 dark:to-accent/25 border border-primary/20 p-6 md:p-8 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-200"
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 dark:text-primary/80">
            Attendance Report
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {displayDate}
          </h2>
          <p className="text-muted-foreground text-sm">
            {totalEmployees} employees registered
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div className="text-right">
            <div className="flex items-end gap-1 justify-end">
              <span className="font-display font-bold text-6xl md:text-7xl leading-none text-primary">
                {isLoading ? (
                  <Skeleton className="h-16 w-24 inline-block" />
                ) : (
                  <AnimatedCounter value={attendanceRate} />
                )}
              </span>
              <span className="font-display font-bold text-3xl text-primary/70 pb-1">
                %
              </span>
            </div>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">
                attendance rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card
          data-ocid="summary.present_card"
          className="shadow-card border-border dark:border-border transition-colors duration-200 overflow-hidden"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-success-bg">
                <Users className="w-3.5 h-3.5 text-success" />
              </div>
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton
                className="h-10 w-16"
                data-ocid="summary.loading_state"
              />
            ) : (
              <p className="text-4xl font-display font-bold text-success">
                <AnimatedCounter value={presentCount} />
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          data-ocid="summary.late_card"
          className="shadow-card border-border dark:border-border transition-colors duration-200 overflow-hidden"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning-bg">
                <Clock className="w-3.5 h-3.5 text-warning" />
              </div>
              Late
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-4xl font-display font-bold text-warning">
                <AnimatedCounter value={lateCount} />
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          data-ocid="summary.absent_card"
          className="shadow-card border-border dark:border-border transition-colors duration-200 overflow-hidden"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-absent-bg">
                <UserX className="w-3.5 h-3.5 text-absent" />
              </div>
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-4xl font-display font-bold text-absent">
                <AnimatedCounter value={absentCount} />
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donut chart + employee lists */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pt-2">
            {isLoading ? (
              <Skeleton className="w-36 h-36 rounded-full" />
            ) : (
              <DonutChart
                segments={[
                  {
                    label: "Present",
                    value: presentCount,
                    color: DONUT_COLORS.present,
                  },
                  { label: "Late", value: lateCount, color: DONUT_COLORS.late },
                  {
                    label: "Absent",
                    value: absentCount,
                    color: DONUT_COLORS.absent,
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <EmployeeList
            title="Present"
            employees={presentEmployees}
            status="present"
            loading={isLoading}
          />
          <EmployeeList
            title="Late"
            employees={lateEmployees}
            status="late"
            loading={isLoading}
          />
          <EmployeeList
            title="Absent"
            employees={absentEmployees}
            status="absent"
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function EmployeeList({
  title,
  employees,
  status,
  loading,
}: {
  title: string;
  employees: string[];
  status: string;
  loading: boolean;
}) {
  const avatarColors: Record<string, string> = {
    present: "bg-success-bg text-success",
    late: "bg-warning-bg text-warning",
    absent: "bg-absent-bg text-absent",
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="font-display">{title}</span>
          <StatusBadge status={status} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No employees
          </p>
        ) : (
          <ul className="space-y-1.5">
            {employees.map((name) => (
              <li
                key={name}
                className="text-sm px-2 py-1.5 rounded-md bg-secondary/50 text-foreground flex items-center gap-2"
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    avatarColors[status] ?? "bg-secondary text-foreground"
                  }`}
                >
                  {getInitials(name)}
                </span>
                <span className="truncate">{name}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
