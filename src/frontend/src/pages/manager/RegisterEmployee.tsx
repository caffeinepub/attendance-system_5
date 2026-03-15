import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Edit2,
  Loader2,
  RefreshCw,
  Save,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCamera } from "../../camera/useCamera";
import {
  averageDescriptors,
  detectFaceWithBox,
  useFaceApi,
} from "../../hooks/useFaceApi";
import {
  useEmployees,
  useRegisterEmployee,
  useUpdateEmployee,
} from "../../hooks/useQueries";
import type { Employee } from "../../hooks/useQueries";

const SAMPLE_COUNT = 5;

type CaptureState = "idle" | "live" | "sampling" | "done";

export default function RegisterEmployee() {
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    department: "",
    dailySalary: "",
  });
  const [faceDescriptor, setFaceDescriptor] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [sampleCount, setSampleCount] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Edit modal state
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    department: "",
    dailySalary: "",
  });

  const { isLoaded, error: apiError, progress } = useFaceApi();
  const { videoRef, canvasRef, isActive, startCamera, stopCamera } = useCamera({
    facingMode: "user",
  });
  const registerMutation = useRegisterEmployee();
  const updateMutation = useUpdateEmployee();
  const { data: employees } = useEmployees();
  const scanLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const samplesRef = useRef<number[][]>([]);

  useEffect(
    () => () => {
      if (scanLoopRef.current) clearTimeout(scanLoopRef.current);
      stopCamera();
    },
    [stopCamera],
  );

  const drawOverlay = useCallback(
    (
      box: { x: number; y: number; width: number; height: number } | null,
      color: string,
    ) => {
      const canvas = overlayRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      canvas.width = video.clientWidth || video.offsetWidth;
      canvas.height = video.clientHeight || video.offsetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!box) return;
      const scaleX = canvas.width / (video.videoWidth || canvas.width);
      const scaleY = canvas.height / (video.videoHeight || canvas.height);
      const mx = canvas.width - (box.x + box.width) * scaleX;
      const my = box.y * scaleY;
      const mw = box.width * scaleX;
      const mh = box.height * scaleY;
      const seg = Math.min(mw, mh) * 0.28;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
      const pts: [number, number, number, number, number, number][] = [
        [mx, my, mx + seg, my, mx, my + seg],
        [mx + mw - seg, my, mx + mw, my, mx + mw, my + seg],
        [mx, my + mh - seg, mx, my + mh, mx + seg, my + mh],
        [mx + mw, my + mh - seg, mx + mw, my + mh, mx + mw - seg, my + mh],
      ];
      for (const [x1, y1, x2, y2, x3, y3] of pts) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.stroke();
      }
    },
    [videoRef],
  );

  const runSampleLoop = useCallback(async () => {
    if (!videoRef.current || !isLoaded) return;
    const detection = await detectFaceWithBox(videoRef.current);
    if (!detection) {
      setFaceDetected(false);
      drawOverlay(null, "#3b82f6");
    } else {
      setFaceDetected(true);
      drawOverlay(detection.detection.box, "#22c55e");
      if (captureState === "sampling") {
        const descriptor = Array.from(detection.descriptor as Float32Array);
        samplesRef.current = [...samplesRef.current, descriptor];
        setSampleCount(samplesRef.current.length);
        if (samplesRef.current.length >= SAMPLE_COUNT) {
          const averaged = averageDescriptors(samplesRef.current);
          setFaceDescriptor(JSON.stringify(averaged));
          const video = videoRef.current;
          const cap = canvasRef.current;
          if (cap && video) {
            cap.width = video.videoWidth;
            cap.height = video.videoHeight;
            const ctx2 = cap.getContext("2d");
            if (ctx2) {
              ctx2.translate(cap.width, 0);
              ctx2.scale(-1, 1);
              ctx2.drawImage(video, 0, 0);
              cap.toBlob(
                (blob) => {
                  if (blob) {
                    const file = new File([blob], "face.jpg", {
                      type: "image/jpeg",
                    });
                    setCapturedPhoto(file);
                    setPreviewUrl(URL.createObjectURL(blob));
                  }
                },
                "image/jpeg",
                0.9,
              );
            }
          }
          setCaptureState("done");
          stopCamera();
          return;
        }
      }
    }
    if (captureState === "live" || captureState === "sampling") {
      scanLoopRef.current = setTimeout(runSampleLoop, 300);
    }
  }, [isLoaded, captureState, videoRef, canvasRef, drawOverlay, stopCamera]);

  useEffect(() => {
    if (
      (captureState === "live" || captureState === "sampling") &&
      isActive &&
      isLoaded
    ) {
      scanLoopRef.current = setTimeout(runSampleLoop, 300);
    }
    return () => {
      if (scanLoopRef.current) clearTimeout(scanLoopRef.current);
    };
  }, [captureState, isActive, isLoaded, runSampleLoop]);

  const handleStartCamera = async () => {
    samplesRef.current = [];
    setSampleCount(0);
    setFaceDetected(false);
    setFaceDescriptor(null);
    setCapturedPhoto(null);
    setPreviewUrl(null);
    setCaptureState("live");
    await startCamera();
  };

  const handleCapture = () => {
    if (!faceDetected) {
      toast.error("No face detected. Position your face clearly.");
      return;
    }
    samplesRef.current = [];
    setSampleCount(0);
    setCaptureState("sampling");
  };

  const handleRetake = () => {
    if (scanLoopRef.current) clearTimeout(scanLoopRef.current);
    samplesRef.current = [];
    setSampleCount(0);
    setFaceDetected(false);
    setFaceDescriptor(null);
    setCapturedPhoto(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaptureState("live");
    startCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceDescriptor || !capturedPhoto) {
      toast.error("Please capture the employee's face first.");
      return;
    }
    if (
      !form.employeeId ||
      !form.name ||
      !form.department ||
      !form.dailySalary
    ) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await registerMutation.mutateAsync({
        employeeId: form.employeeId,
        name: form.name,
        department: form.department,
        dailySalary: Math.round(Number.parseFloat(form.dailySalary) / 26),
        faceDescriptor,
        photoFile: capturedPhoto,
      });
      toast.success(`${form.name} registered successfully!`);
      setForm({ employeeId: "", name: "", department: "", dailySalary: "" });
      setFaceDescriptor(null);
      setCapturedPhoto(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setCaptureState("idle");
      samplesRef.current = [];
      setSampleCount(0);
    } catch (err: any) {
      toast.error(err?.message ?? "Registration failed.");
    }
  };

  const handleEditOpen = (emp: Employee) => {
    setEditEmployee(emp);
    setEditForm({
      name: emp.name,
      department: emp.department,
      dailySalary: String(Number(emp.dailySalary) * 26),
    });
  };

  const handleEditSave = async () => {
    if (!editEmployee) return;
    if (!editForm.name || !editForm.department || !editForm.dailySalary) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        employeeId: editEmployee.employeeId,
        name: editForm.name,
        department: editForm.department,
        dailySalary: Math.round(Number(editForm.dailySalary) / 26),
        // Preserve existing face data
        faceDescriptor: editEmployee.faceDescriptor,
        existingPhotoUrl: editEmployee.photo.getDirectURL(),
      });
      toast.success(`${editForm.name} updated successfully!`);
      setEditEmployee(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Update failed.");
    }
  };

  const statusLabel = {
    idle: "",
    live: faceDetected
      ? "Face detected \u2014 click Capture Face"
      : "Position your face in the frame",
    sampling: `Capturing... ${sampleCount}/${SAMPLE_COUNT}`,
    done: "Face captured successfully",
  }[captureState];

  const statusColor = {
    idle: "",
    live: faceDetected ? "text-green-400" : "text-blue-400",
    sampling: "text-amber-400",
    done: "text-green-400",
  }[captureState];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-3">
          <UserPlus className="w-7 h-7 text-primary" />
          Register Employee
        </h1>
        <p className="text-muted-foreground mt-1">
          Add a new employee and capture their face for recognition.
        </p>
      </div>

      {/* Registration Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-empId">Employee ID</Label>
                <Input
                  id="reg-empId"
                  data-ocid="register.employee_id.input"
                  placeholder="EMP001"
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, employeeId: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  data-ocid="register.name.input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-dept">Department</Label>
                <Input
                  id="reg-dept"
                  data-ocid="register.department.input"
                  placeholder="Department"
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-salary">Monthly Salary (₹)</Label>
                <Input
                  id="reg-salary"
                  data-ocid="register.salary.input"
                  type="number"
                  placeholder="Monthly salary"
                  value={form.dailySalary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dailySalary: e.target.value }))
                  }
                />
                {form.dailySalary && (
                  <p className="text-xs text-muted-foreground">
                    Per Day: ₹
                    {Math.round(Number(form.dailySalary) / 26).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="py-1">
                {captureState === "done" ? (
                  <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 gap-1">
                    <CheckCircle className="w-3 h-3" /> Face Captured (
                    {SAMPLE_COUNT} samples)
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 text-muted-foreground"
                  >
                    <AlertCircle className="w-3 h-3" /> Face not captured
                  </Badge>
                )}
              </div>
              <Button
                data-ocid="register.submit_button"
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending || captureState !== "done"}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Registering...
                  </>
                ) : (
                  "Register Employee"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Face Capture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isLoaded && !apiError && (
              <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-400/10 rounded-lg px-3 py-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{progress}</span>
              </div>
            )}
            {apiError && (
              <div
                data-ocid="register.face-api.error_state"
                className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2"
              >
                {apiError}
              </div>
            )}
            <div
              className="relative rounded-xl overflow-hidden bg-black"
              style={{ aspectRatio: "4/3" }}
            >
              {captureState === "done" && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Captured face"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{
                      transform: "scaleX(-1)",
                      display: isActive ? "block" : "none",
                    }}
                  />
                  {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Camera className="w-10 h-10 opacity-30" />
                      <span className="text-xs">Camera preview</span>
                    </div>
                  )}
                  <canvas
                    ref={overlayRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {captureState === "sampling" && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 px-3 py-2">
                      <div className="flex justify-between text-xs text-white mb-1">
                        <span>Capturing samples...</span>
                        <span>
                          {sampleCount}/{SAMPLE_COUNT}
                        </span>
                      </div>
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{
                            width: `${(sampleCount / SAMPLE_COUNT) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              {isActive && captureState !== "sampling" && (
                <>
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-white/20" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-white/20" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-white/20" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-white/20" />
                </>
              )}
              {captureState === "done" && (
                <div className="absolute inset-x-0 bottom-0 bg-green-500/90 py-2 px-3 text-white text-xs font-semibold text-center">
                  ✓ Face captured successfully
                </div>
              )}
            </div>
            {statusLabel && (
              <p className={`text-xs ${statusColor}`}>{statusLabel}</p>
            )}
            {captureState === "idle" && (
              <Button
                type="button"
                data-ocid="register.camera.button"
                variant="outline"
                className="w-full"
                onClick={handleStartCamera}
                disabled={!isLoaded}
              >
                <Camera className="w-4 h-4 mr-2" /> Start Camera
              </Button>
            )}
            {captureState === "live" && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  data-ocid="register.scan.button"
                  className="flex-1"
                  onClick={handleCapture}
                  disabled={!faceDetected}
                >
                  Capture Face
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    stopCamera();
                    setCaptureState("idle");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
            {captureState === "sampling" && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Capturing{" "}
                {sampleCount}/{SAMPLE_COUNT}...
              </Button>
            )}
            {captureState === "done" && (
              <Button
                type="button"
                data-ocid="register.retake.button"
                variant="outline"
                className="w-full"
                onClick={handleRetake}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Retake
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Employees Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Registered Employees
            <span className="text-sm font-normal text-muted-foreground ml-1">
              — click Edit to modify details
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!employees?.length ? (
            <div
              data-ocid="register.employees.empty_state"
              className="p-8 text-center text-muted-foreground text-sm"
            >
              No employees registered yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead>Per Day</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp, idx) => (
                  <TableRow
                    key={emp.employeeId}
                    data-ocid={`register.employees.row.${idx + 1}`}
                  >
                    <TableCell className="font-mono text-xs">
                      {emp.employeeId}
                    </TableCell>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.department}
                    </TableCell>
                    <TableCell>
                      ₹{(Number(emp.dailySalary) * 26).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ₹{Number(emp.dailySalary).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`register.employees.edit_button.${idx + 1}`}
                        onClick={() => handleEditOpen(emp)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editEmployee}
        onOpenChange={(open) => !open && setEditEmployee(null)}
      >
        <DialogContent data-ocid="register.edit.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Edit Employee — {editEmployee?.employeeId}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                data-ocid="register.edit.name.input"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept">Department</Label>
              <Input
                id="edit-dept"
                data-ocid="register.edit.department.input"
                value={editForm.department}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, department: e.target.value }))
                }
                placeholder="Department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-salary">Monthly Salary (₹)</Label>
              <Input
                id="edit-salary"
                data-ocid="register.edit.salary.input"
                type="number"
                value={editForm.dailySalary}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, dailySalary: e.target.value }))
                }
                placeholder="Monthly salary"
              />
              {editForm.dailySalary && (
                <p className="text-xs text-muted-foreground">
                  Per Day: ₹
                  {Math.round(
                    Number(editForm.dailySalary) / 26,
                  ).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                data-ocid="register.edit.save_button"
                className="flex-1"
                onClick={handleEditSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                data-ocid="register.edit.cancel_button"
                variant="outline"
                onClick={() => setEditEmployee(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
