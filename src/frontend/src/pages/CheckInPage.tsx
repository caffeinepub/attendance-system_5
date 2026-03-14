import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CameraCapture from "../components/CameraCapture";
import LiveClock from "../components/LiveClock";
import { useAddAttendance, useEmployees } from "../hooks/useQueries";

export default function CheckInPage() {
  const { data: employees, isLoading: empLoading } = useEmployees();
  const addAttendance = useAddAttendance();

  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [status, setStatus] = useState("present");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedEmployee = employees?.find((e) => e.id === selectedEmpId);

  const handleSubmit = async () => {
    if (!selectedEmployee || !photoFile) {
      toast.error("Please select an employee and capture a photo.");
      return;
    }
    try {
      await addAttendance.mutateAsync({
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        department: selectedEmployee.department,
        photoFile,
        status,
      });
      setSuccess(true);
      toast.success(`Attendance recorded for ${selectedEmployee.name}`);
      setTimeout(() => {
        setSuccess(false);
        setSelectedEmpId("");
        setStatus("present");
        setPhotoFile(null);
        setPhotoPreview(null);
      }, 3000);
    } catch {
      toast.error("Failed to record attendance. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-success-bg flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground text-center">
          {status === "clockout" ? "Clocked Out!" : "Check-In Successful!"}
        </h2>
        <p className="text-muted-foreground text-lg text-center">
          {selectedEmployee?.name} has been marked as{" "}
          <span className="font-semibold capitalize">{status}</span>.
        </p>
        <p className="text-sm text-muted-foreground">
          Resetting in a moment...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Check-In Station
        </h1>
        <p className="text-muted-foreground mt-2">
          Select your name, choose status, and capture your photo
        </p>
      </div>

      {/* Live Clock */}
      <LiveClock />

      <Card className="shadow-card-hover">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Record Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee Select */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Employee</Label>
            <Select
              value={selectedEmpId}
              onValueChange={setSelectedEmpId}
              disabled={empLoading}
            >
              <SelectTrigger
                data-ocid="checkin.employee_select"
                className="h-12 text-base"
              >
                <SelectValue
                  placeholder={empLoading ? "Loading..." : "Select your name"}
                />
              </SelectTrigger>
              <SelectContent>
                {(employees ?? []).map((emp) => (
                  <SelectItem key={emp.id} value={emp.id} className="text-base">
                    {emp.name} —{" "}
                    <span className="text-muted-foreground">
                      {emp.department}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                data-ocid="checkin.status_select"
                className="h-12 text-base"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present" className="text-base">
                  ✅ Present
                </SelectItem>
                <SelectItem value="late" className="text-base">
                  🕐 Late
                </SelectItem>
                <SelectItem value="clockout" className="text-base">
                  🚪 Clock-Out
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Camera */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Capture Photo</Label>
            <CameraCapture
              large
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
          </div>

          {/* Submit */}
          <Button
            data-ocid="checkin.submit_button"
            className="w-full h-14 text-lg font-semibold"
            onClick={handleSubmit}
            disabled={!selectedEmpId || !photoFile || addAttendance.isPending}
          >
            {addAttendance.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Recording...
              </>
            ) : status === "clockout" ? (
              "Record Clock-Out"
            ) : (
              "Record Check-In"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
