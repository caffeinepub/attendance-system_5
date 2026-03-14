import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InboxIcon,
  Loader2,
  Search,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CameraCapture from "../components/CameraCapture";
import {
  formatTimestamp,
  useAllAttendance,
  useDeleteEmployee,
  useEmployees,
  useRegisterEmployee,
} from "../hooks/useQueries";
import type { Employee } from "../hooks/useQueries";

const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Design",
  "Customer Support",
  "Other",
];

export default function AdminPage() {
  const { data: employees, isLoading } = useEmployees();
  const { data: allAttendance } = useAllAttendance();
  const deleteEmployee = useDeleteEmployee();
  const [showRegister, setShowRegister] = useState(false);
  const [search, setSearch] = useState("");

  const getAttendanceCount = (empId: string) =>
    allAttendance?.filter((r) => r.employeeId === empId).length ?? 0;

  const filteredEmployees = (employees ?? []).filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteEmployee.mutateAsync(id);
      toast.success(`${name} has been removed.`);
    } catch {
      toast.error("Failed to delete employee.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Employee Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Register and manage your organization's employees
          </p>
        </div>
        <Button
          data-ocid="admin.register_open_modal_button"
          onClick={() => setShowRegister(true)}
          className="shrink-0"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Register Employee
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          data-ocid="admin.search_input"
          placeholder="Search by name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border shadow-card overflow-hidden bg-card">
        <Table data-ocid="admin.employee_table">
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Department</TableHead>
              <TableHead className="hidden md:table-cell">Registered</TableHead>
              <TableHead className="hidden md:table-cell">Attendance</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              ["r1", "r2", "r3", "r4"].map((skelId) => (
                <TableRow key={skelId}>
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div
                    data-ocid="admin.employee.empty_state"
                    className="py-16 flex flex-col items-center gap-3 text-muted-foreground"
                  >
                    <InboxIcon className="w-10 h-10 opacity-30" />
                    <p className="text-sm">
                      {search
                        ? "No employees match your search."
                        : "No employees registered yet."}
                    </p>
                    {!search && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRegister(true)}
                      >
                        Register first employee
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp: Employee, idx: number) => {
                const { date } = formatTimestamp(emp.createdAt);
                const attendanceCount = getAttendanceCount(emp.id);
                return (
                  <TableRow
                    key={emp.id}
                    data-ocid={`admin.employee.row.${idx + 1}`}
                  >
                    <TableCell>
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={emp.photo.getDirectURL()}
                          alt={emp.name}
                        />
                        <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-sm">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {emp.department}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {date}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {attendanceCount}{" "}
                        {attendanceCount === 1 ? "day" : "days"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        data-ocid={`admin.employee.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(emp.id, emp.name)}
                        disabled={deleteEmployee.isPending}
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

      <RegisterModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
      />
    </div>
  );
}

function RegisterModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const registerEmployee = useRegisterEmployee();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName("");
    setDepartment("");
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !department || !photoFile) {
      toast.error("Please fill all fields and add a photo.");
      return;
    }
    try {
      await registerEmployee.mutateAsync({
        name: name.trim(),
        department,
        photoFile,
      });
      toast.success(`${name.trim()} registered successfully!`);
      handleClose();
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent data-ocid="register.dialog" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Register New Employee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input
              data-ocid="register.name_input"
              placeholder="e.g. Sarah Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger data-ocid="register.department_input">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Employee Photo</Label>
            <Tabs defaultValue="webcam">
              <TabsList className="w-full">
                <TabsTrigger
                  data-ocid="register.webcam_tab"
                  value="webcam"
                  className="flex-1"
                >
                  Webcam
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="register.upload_tab"
                  value="upload"
                  className="flex-1"
                >
                  Upload File
                </TabsTrigger>
              </TabsList>
              <TabsContent value="webcam" className="mt-3">
                <CameraCapture
                  capturedPreview={photoPreview}
                  onCapture={(file, url) => {
                    setPhotoFile(file);
                    setPhotoPreview(url);
                  }}
                  onClear={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                />
              </TabsContent>
              <TabsContent value="upload" className="mt-3">
                <div className="space-y-3">
                  {photoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border h-52">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-3 right-3"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full h-52 rounded-xl border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) =>
                        e.key === "Enter" && fileInputRef.current?.click()
                      }
                    >
                      <Upload className="w-8 h-8 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload photo
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        JPG, PNG, WEBP up to 5MB
                      </p>
                    </button>
                  )}
                  <input
                    data-ocid="register.upload_button"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {!photoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" /> Choose File
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            data-ocid="register.cancel_button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="register.submit_button"
            onClick={handleSubmit}
            disabled={registerEmployee.isPending}
          >
            {registerEmployee.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...
              </>
            ) : (
              "Register Employee"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
