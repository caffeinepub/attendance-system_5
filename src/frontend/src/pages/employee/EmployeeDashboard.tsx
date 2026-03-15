import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle,
  DollarSign,
  IndianRupee,
  LogOut,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  formatDate,
  useAttendanceByEmployee,
  useSalaryByEmployee,
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

function getTimeFromNote(note: string | undefined): string {
  if (!note) return "—";
  const timeMatch = note.match(/\d{1,2}:\d{2}\s?[AP]M/i);
  return timeMatch ? timeMatch[0] : note;
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { currentEmployee, setCurrentEmployee } = useAppContext();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    if (!currentEmployee) {
      navigate({ to: "/employee" });
    }
  }, [currentEmployee, navigate]);

  const { data: attendance, isLoading: attLoading } = useAttendanceByEmployee(
    currentEmployee?.employeeId ?? "",
  );
  const { data: payments, isLoading: payLoading } = useSalaryByEmployee(
    currentEmployee?.employeeId ?? "",
  );

  if (!currentEmployee) return null;

  const dailySalary = Number(currentEmployee.dailySalary);

  // Build YYYY-MM prefix for filtering
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  const filteredAttendance = (attendance ?? []).filter((rec) =>
    rec.date.startsWith(monthPrefix),
  );

  const daysPresent = filteredAttendance.filter(
    (a) => a.status === "present",
  ).length;
  const daysAbsent = filteredAttendance.filter(
    (a) => a.status === "absent",
  ).length;
  const earnedSalary = daysPresent * dailySalary;
  const monthlySalary = dailySalary * 26;

  const currentYr = now.getFullYear();
  const years = [
    currentYr - 2,
    currentYr - 1,
    currentYr,
    currentYr + 1,
    currentYr + 2,
  ];

  const handleLogout = () => {
    setCurrentEmployee(null);
    navigate({ to: "/employee" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="emp-dashboard.back.button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-border">|</span>
          <span className="font-display font-bold text-lg">
            PAVITHRA EXPLOSIVES
          </span>
        </div>
        <Button
          data-ocid="emp-dashboard.logout.button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-display font-bold text-primary">
              {currentEmployee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-foreground">
                {currentEmployee.name}
              </h1>
              <p className="text-muted-foreground">
                {currentEmployee.department} &bull; ID:{" "}
                {currentEmployee.employeeId}
              </p>
            </div>
          </div>
        </div>

        {/* Month / Year Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-border bg-card">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground">
            Filter by Month:
          </span>
          <select
            data-ocid="emp-dashboard.month.select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="h-8 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {MONTHS.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            data-ocid="emp-dashboard.year.select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-8 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
          <span className="ml-auto text-sm font-semibold text-primary">
            Showing: {MONTHS[selectedMonth - 1]} {selectedYear}
          </span>
        </div>

        {/* Stats grid: 2x3 (or responsive wrapping 2 cols) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Days Present */}
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Present
                </span>
              </div>
              <div className="font-display font-bold text-3xl text-foreground">
                {daysPresent}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Days Present
              </div>
            </CardContent>
          </Card>

          {/* Days Absent */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Absent
                </span>
              </div>
              <div className="font-display font-bold text-3xl text-foreground">
                {daysAbsent}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Days Absent
              </div>
            </CardContent>
          </Card>

          {/* Earned This Month */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 col-span-2 lg:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Earned
                </span>
              </div>
              <div className="font-display font-bold text-3xl text-foreground">
                ₹{earnedSalary.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Earned — {MONTHS[selectedMonth - 1]}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Salary */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Monthly
                </span>
              </div>
              <div className="font-display font-bold text-3xl text-foreground">
                ₹{monthlySalary.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Monthly Salary
              </div>
            </CardContent>
          </Card>

          {/* Salary Per Day */}
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/15 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Per Day
                </span>
              </div>
              <div className="font-display font-bold text-3xl text-foreground">
                ₹{dailySalary.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Salary Per Day
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Table (filtered) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Calendar className="w-5 h-5 text-primary" />
                Attendance — {MONTHS[selectedMonth - 1]} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {attLoading ? (
                <div
                  data-ocid="emp-dashboard.attendance.loading_state"
                  className="p-4 space-y-2"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !filteredAttendance.length ? (
                <div
                  data-ocid="emp-dashboard.attendance.empty_state"
                  className="p-8 text-center text-muted-foreground"
                >
                  No attendance records for {MONTHS[selectedMonth - 1]}{" "}
                  {selectedYear}.
                </div>
              ) : (
                <Table data-ocid="emp-dashboard.attendance.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...filteredAttendance]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((rec, idx) => (
                        <TableRow
                          key={rec.id}
                          data-ocid={`emp-dashboard.attendance.row.${idx + 1}`}
                        >
                          <TableCell className="text-sm">
                            {formatDate(rec.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                rec.status === "present"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                rec.status === "present"
                                  ? "bg-success-bg text-success-foreground"
                                  : ""
                              }
                            >
                              {rec.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {getTimeFromNote(rec.note)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Salary Payment History (unfiltered) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <DollarSign className="w-5 h-5 text-primary" />
                Salary Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {payLoading ? (
                <div
                  data-ocid="emp-dashboard.salary.loading_state"
                  className="p-4 space-y-2"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !payments?.length ? (
                <div
                  data-ocid="emp-dashboard.salary.empty_state"
                  className="p-8 text-center text-muted-foreground"
                >
                  No salary payments recorded yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...payments]
                      .sort((a, b) => b.paidDate.localeCompare(a.paidDate))
                      .map((pay, idx) => (
                        <TableRow
                          key={String(pay.id)}
                          data-ocid={`emp-dashboard.salary.row.${idx + 1}`}
                        >
                          <TableCell className="text-sm">
                            {formatDate(pay.paidDate)}
                          </TableCell>
                          <TableCell className="font-medium text-success">
                            ₹{Number(pay.amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {pay.note || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
