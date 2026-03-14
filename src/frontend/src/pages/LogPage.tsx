import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  CalendarDays,
  Download,
  InboxIcon,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import StatusBadge from "../components/StatusBadge";
import {
  formatTimestamp,
  todayString,
  useAttendanceByDate,
  useDeleteAttendance,
} from "../hooks/useQueries";
import type { AttendanceRecord } from "../hooks/useQueries";

export default function LogPage() {
  const [date, setDate] = useState(todayString());
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const { data: records, isLoading } = useAttendanceByDate(date);
  const deleteRecord = useDeleteAttendance();

  // Unique departments from records
  const departments = Array.from(
    new Set((records ?? []).map((r) => r.department).filter(Boolean)),
  ).sort();

  const filteredRecords = (records ?? []).filter((r) => {
    const matchesSearch =
      !search || r.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "all" || r.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteRecord.mutateAsync(id);
      toast.success(`Record for ${name} deleted.`);
    } catch {
      toast.error("Failed to delete record.");
    }
  };

  const handleExport = () => {
    if (!records || records.length === 0) {
      toast.error("No records to export.");
      return;
    }
    const rows = [
      ["Name", "Department", "Date", "Time", "Status"],
      ...records.map((r) => {
        const { date: d, time: t } = formatTimestamp(r.checkInTime);
        return [r.employeeName, r.department, d, t, r.status];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-log-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Attendance Log
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage attendance records by date
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              data-ocid="log.date_input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9 w-44"
            />
          </div>
          <Button
            data-ocid="log.export_button"
            variant="outline"
            onClick={handleExport}
            className="shrink-0"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button
            data-ocid="log.print_button"
            variant="outline"
            onClick={() => window.print()}
            className="shrink-0 no-print"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="log.search_input"
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger
            data-ocid="log.department_select"
            className="w-full sm:w-48"
          >
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border shadow-card overflow-hidden bg-card print-table">
        <Table data-ocid="log.table">
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="w-16 no-print">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Department</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 no-print" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              ["r1", "r2", "r3", "r4", "r5"].map((skelId) => (
                <TableRow key={skelId} data-ocid="log.loading_state">
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div
                    data-ocid="log.empty_state"
                    className="py-16 flex flex-col items-center gap-3 text-muted-foreground"
                  >
                    <InboxIcon className="w-10 h-10 opacity-30" />
                    <p className="text-sm">
                      {search || deptFilter !== "all"
                        ? "No records match your filters."
                        : "No attendance records for this date."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record: AttendanceRecord, idx: number) => {
                const { date: d, time: t } = formatTimestamp(
                  record.checkInTime,
                );
                return (
                  <TableRow
                    key={record.id}
                    data-ocid={`log.record.row.${idx + 1}`}
                  >
                    <TableCell className="no-print">
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          src={record.photo.getDirectURL()}
                          alt={record.employeeName}
                        />
                        <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                          {record.employeeName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.employeeName}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {record.department}
                    </TableCell>
                    <TableCell className="text-sm">{d}</TableCell>
                    <TableCell className="text-sm font-mono">{t}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="no-print">
                      <Button
                        data-ocid={`log.record.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          handleDelete(record.id, record.employeeName)
                        }
                        disabled={deleteRecord.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
