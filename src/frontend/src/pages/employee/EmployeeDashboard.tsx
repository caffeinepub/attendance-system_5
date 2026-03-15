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
  XCircle,
} from "lucide-react";
import { useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  formatDate,
  useAttendanceByEmployee,
  useSalaryByEmployee,
} from "../../hooks/useQueries";

// Extract time from note field if it looks like a time string
function getTimeFromNote(note: string | undefined): string {
  if (!note) return "—";
  const timeMatch = note.match(/\d{1,2}:\d{2}\s?[AP]M/i);
  return timeMatch ? timeMatch[0] : note;
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { currentEmployee, setCurrentEmployee } = useAppContext();

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

  const daysPresent =
    attendance?.filter((a) => a.status === "present").length ?? 0;
  const daysAbsent =
    attendance?.filter((a) => a.status === "absent").length ?? 0;
  const dailySalary = Number(currentEmployee.dailySalary);
  // totalSalaryThisMonth removed - using dailySalary * 26 instead

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
        <div className="mb-8">
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

        {/* 4 key stats in 2x2 grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
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
                ₹{(dailySalary * 26).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Monthly Salary
              </div>
            </CardContent>
          </Card>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Calendar className="w-5 h-5 text-primary" />
                Attendance History
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
              ) : !attendance?.length ? (
                <div
                  data-ocid="emp-dashboard.attendance.empty_state"
                  className="p-8 text-center text-muted-foreground"
                >
                  No attendance records found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...attendance]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 30)
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
