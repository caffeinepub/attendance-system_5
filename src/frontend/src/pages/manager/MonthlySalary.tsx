import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, DollarSign, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  todayString,
  useAddSalaryPayment,
  useAllAttendance,
  useAllSalaryPayments,
  useEmployees,
} from "../../hooks/useQueries";
import type { Employee } from "../../hooks/useQueries";

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

export default function MonthlySalary() {
  const now = new Date();
  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [year, setYear] = useState(String(now.getFullYear()));
  const [payDialog, setPayDialog] = useState<Employee | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

  const { data: employees, isLoading: empLoading } = useEmployees();
  const { data: allAttendance, isLoading: attLoading } = useAllAttendance();
  const { data: allPayments, isLoading: payLoading } = useAllSalaryPayments();
  const addPayment = useAddSalaryPayment();

  const years = Array.from({ length: 5 }, (_, i) =>
    String(now.getFullYear() - 2 + i),
  );

  const salaryData = useMemo(() => {
    if (!employees || !allAttendance || !allPayments) return [];
    return employees.map((emp) => {
      const monthAttendance = allAttendance.filter(
        (a) =>
          a.employeeId === emp.employeeId &&
          a.date.startsWith(`${year}-${month}`) &&
          a.status === "present",
      );
      const daysPresent = monthAttendance.length;
      const dailySalary = Number(emp.dailySalary);
      const grossSalary = daysPresent * dailySalary;
      const monthPayments = allPayments.filter(
        (p) =>
          p.employeeId === emp.employeeId &&
          p.paidDate.startsWith(`${year}-${month}`),
      );
      const totalPaid = monthPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      const balance = grossSalary - totalPaid;
      return { emp, daysPresent, dailySalary, grossSalary, totalPaid, balance };
    });
  }, [employees, allAttendance, allPayments, year, month]);

  const handlePay = async () => {
    if (!payDialog || !payAmount) return;
    try {
      await addPayment.mutateAsync({
        employeeId: payDialog.employeeId,
        amount: Number.parseFloat(payAmount),
        paidDate: todayString(),
        note:
          payNote ||
          `Salary payment for ${MONTHS[Number.parseInt(month) - 1]} ${year}`,
      });
      toast.success(`Payment of ₹${payAmount} recorded for ${payDialog.name}`);
      setPayDialog(null);
      setPayAmount("");
      setPayNote("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to record payment.");
    }
  };

  const isLoading = empLoading || attLoading || payLoading;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-primary" />
          Monthly Salary
        </h1>
        <p className="text-muted-foreground mt-1">
          View and record salary payments.
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex gap-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger data-ocid="salary.month.select" className="w-40">
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
            <SelectTrigger data-ocid="salary.year.select" className="w-28">
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

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">
            {MONTHS[Number.parseInt(month) - 1]} {year} — Salary Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              data-ocid="salary.table.loading_state"
              className="p-4 space-y-2"
            >
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !salaryData.length ? (
            <div
              data-ocid="salary.table.empty_state"
              className="p-8 text-center text-muted-foreground"
            >
              No employees found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-center">Days Present</TableHead>
                  <TableHead className="text-right">Per Day</TableHead>
                  <TableHead className="text-right">Total Earned</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="w-28">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryData.map(
                  (
                    {
                      emp,
                      daysPresent,
                      dailySalary,
                      grossSalary,
                      totalPaid,
                      balance,
                    },
                    idx,
                  ) => (
                    <TableRow key={emp.id} data-ocid={`salary.row.${idx + 1}`}>
                      <TableCell>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {emp.employeeId} · {emp.department}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {daysPresent}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{dailySalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{grossSalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        ₹{totalPaid.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${balance > 0 ? "text-absent" : "text-success"}`}
                      >
                        ₹{balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          data-ocid={`salary.payment.button.${idx + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPayDialog(emp);
                            setPayAmount(String(balance > 0 ? balance : 0));
                            setPayNote("");
                          }}
                          disabled={grossSalary === 0}
                        >
                          <CreditCard className="w-3 h-3 mr-1" /> Pay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog
        open={!!payDialog}
        onOpenChange={(open) => !open && setPayDialog(null)}
      >
        <DialogContent data-ocid="salary.payment.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Record Salary Payment
            </DialogTitle>
          </DialogHeader>
          {payDialog && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted text-sm">
                <div className="font-medium">{payDialog.name}</div>
                <div className="text-muted-foreground">
                  {payDialog.employeeId} · {payDialog.department}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-amount">Amount (₹)</Label>
                <Input
                  id="pay-amount"
                  data-ocid="salary.pay-amount.input"
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-note">Note (optional)</Label>
                <Input
                  id="pay-note"
                  data-ocid="salary.pay-note.input"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. March salary payment"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              data-ocid="salary.payment.cancel_button"
              variant="outline"
              onClick={() => setPayDialog(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="salary.payment.confirm_button"
              onClick={handlePay}
              disabled={addPayment.isPending || !payAmount}
            >
              {addPayment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recording...
                </>
              ) : (
                "Record Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
