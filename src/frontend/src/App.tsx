import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  FileSpreadsheet,
  FileText,
  Lock,
  LogOut,
  Menu,
  Pencil,
  Shield,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

declare const faceapi: any;
declare const Chart: any;
declare const window: any;

type AppView =
  | "landing"
  | "manager-login"
  | "manager"
  | "employee-login"
  | "employee";
type Section =
  | "register"
  | "attendance"
  | "employees"
  | "calendar"
  | "dashboard";

interface Employee {
  name: string;
  id: string;
  type: string;
  monthlySalary: number;
  perDaySalary: number;
  face: number[];
}

interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  inTime: string;
}

function loadEmployees(): Employee[] {
  try {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  } catch {
    return [];
  }
}
function loadAttendance(): AttendanceRecord[] {
  try {
    return JSON.parse(localStorage.getItem("attendance") || "[]");
  } catch {
    return [];
  }
}
function saveEmployees(data: Employee[]) {
  localStorage.setItem("employees", JSON.stringify(data));
}
function saveAttendance(data: AttendanceRecord[]) {
  localStorage.setItem("attendance", JSON.stringify(data));
}

// ── Live Clock ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="font-mono text-sm"
      style={{ color: "oklch(0.55 0.02 255)" }}
    >
      {time.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
      {" · "}
      {time.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </span>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  return (
    <>
      {view === "landing" && (
        <LandingPage
          onManager={() => setView("manager-login")}
          onEmployee={() => setView("employee-login")}
        />
      )}
      {view === "manager-login" && (
        <ManagerLoginPage
          onLogin={() => setView("manager")}
          onBack={() => setView("landing")}
        />
      )}
      {view === "manager" && (
        <ManagerPortal onLogout={() => setView("landing")} />
      )}
      {view === "employee-login" && (
        <EmployeeLoginPage
          onLogin={(emp) => {
            setCurrentEmployee(emp);
            setView("employee");
          }}
          onBack={() => setView("landing")}
        />
      )}
      {view === "employee" && currentEmployee && (
        <EmployeeDashboard
          employee={currentEmployee}
          onBack={() => {
            setCurrentEmployee(null);
            setView("landing");
          }}
        />
      )}
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.025 255)",
            border: "1px solid oklch(0.25 0.04 240)",
            color: "oklch(0.95 0.01 255)",
          },
        }}
      />
    </>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({
  onManager,
  onEmployee,
}: { onManager: () => void; onEmployee: () => void }) {
  return (
    <div className="min-h-screen dot-grid flex flex-col items-center justify-center relative overflow-hidden">
      {/* Top ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.65 0.2 240 / 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg px-6 text-center">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="flex items-center justify-center w-24 h-24 rounded-2xl mb-6 relative"
            style={{
              background: "oklch(0.16 0.04 240)",
              border: "1.5px solid oklch(0.35 0.08 240)",
              boxShadow: "0 0 40px oklch(0.65 0.2 240 / 0.2)",
            }}
          >
            <Shield
              className="w-12 h-12"
              style={{ color: "oklch(0.65 0.2 240)" }}
            />
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full pulse-dot"
              style={{
                background: "oklch(0.65 0.18 145)",
                boxShadow: "0 0 8px oklch(0.65 0.18 145 / 0.7)",
              }}
            />
          </div>
          <h1
            className="text-4xl font-display font-bold tracking-tight"
            style={{ color: "oklch(0.97 0.01 255)", letterSpacing: "-0.02em" }}
          >
            PAVITHRA EXPLOSIVES
          </h1>
          <p
            className="text-base mt-2 font-sans tracking-widest uppercase"
            style={{
              color: "oklch(0.55 0.02 255)",
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
            }}
          >
            Biometric Attendance Management System
          </p>
        </div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            data-ocid="landing.manager_button"
            onClick={onManager}
            className="card-hover rounded-lg p-6 text-left group"
            style={{
              background: "oklch(0.16 0.025 255)",
              border: "1px solid oklch(0.22 0.025 255)",
            }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-md mb-4"
              style={{
                background: "oklch(0.65 0.2 240 / 0.15)",
                border: "1px solid oklch(0.65 0.2 240 / 0.3)",
              }}
            >
              <Lock
                className="w-5 h-5"
                style={{ color: "oklch(0.65 0.2 240)" }}
              />
            </div>
            <h2
              className="font-display font-bold text-lg"
              style={{ color: "oklch(0.97 0.01 255)" }}
            >
              MANAGER ACCESS
            </h2>
            <p
              className="text-sm mt-1.5 leading-relaxed"
              style={{ color: "oklch(0.55 0.02 255)" }}
            >
              Register employees, mark attendance &amp; export reports
            </p>
          </button>

          <button
            type="button"
            data-ocid="landing.employee_button"
            onClick={onEmployee}
            className="card-hover rounded-lg p-6 text-left group"
            style={{
              background: "oklch(0.16 0.025 255)",
              border: "1px solid oklch(0.22 0.025 255)",
            }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-md mb-4"
              style={{
                background: "oklch(0.65 0.18 145 / 0.15)",
                border: "1px solid oklch(0.65 0.18 145 / 0.3)",
              }}
            >
              <User
                className="w-5 h-5"
                style={{ color: "oklch(0.65 0.18 145)" }}
              />
            </div>
            <h2
              className="font-display font-bold text-lg"
              style={{ color: "oklch(0.97 0.01 255)" }}
            >
              EMPLOYEE PORTAL
            </h2>
            <p
              className="text-sm mt-1.5 leading-relaxed"
              style={{ color: "oklch(0.55 0.02 255)" }}
            >
              View attendance records &amp; salary details
            </p>
          </button>
        </div>

        {/* System status bar */}
        <div
          className="mt-8 flex items-center justify-center gap-3 px-5 py-2.5 rounded-md"
          style={{
            background: "oklch(0.14 0.025 255)",
            border: "1px solid oklch(0.22 0.025 255)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full pulse-dot"
            style={{
              background: "oklch(0.65 0.18 145)",
              boxShadow: "0 0 6px oklch(0.65 0.18 145)",
            }}
          />
          <span
            className="text-xs font-mono tracking-widest uppercase"
            style={{ color: "oklch(0.65 0.18 145)" }}
          >
            SYSTEM ONLINE
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: "oklch(0.4 0.02 255)" }}
          >
            |
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: "oklch(0.45 0.02 255)" }}
          >
            BIOMETRIC MODULE ACTIVE
          </span>
        </div>

        <p className="text-xs mt-6" style={{ color: "oklch(0.35 0.02 255)" }}>
          {`© ${new Date().getFullYear()}. Built with love using `}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "oklch(0.45 0.03 240)" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Manager Login ─────────────────────────────────────────────────────────────
function ManagerLoginPage({
  onLogin,
  onBack,
}: { onLogin: () => void; onBack: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (pw === "1234") {
      onLogin();
    } else {
      setError("Authentication failed. Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen dot-grid flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <button
          type="button"
          data-ocid="login.back_button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: "oklch(0.45 0.02 255)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "oklch(0.65 0.2 240)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "oklch(0.45 0.02 255)";
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Portal
        </button>

        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
            style={{
              background: "oklch(0.65 0.2 240 / 0.12)",
              border: "1.5px solid oklch(0.65 0.2 240 / 0.35)",
              boxShadow: "0 0 28px oklch(0.65 0.2 240 / 0.15)",
            }}
          >
            <Shield
              className="w-8 h-8"
              style={{ color: "oklch(0.65 0.2 240)" }}
            />
          </div>
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: "oklch(0.97 0.01 255)" }}
          >
            MANAGER AUTHENTICATION
          </h1>
          <p
            className="text-xs mt-1.5 tracking-widest uppercase font-mono"
            style={{ color: "oklch(0.45 0.02 255)" }}
          >
            Restricted Access
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-lg p-7"
          style={{
            background: "oklch(0.16 0.025 255)",
            border: "1px solid oklch(0.22 0.025 255)",
          }}
        >
          <div className="space-y-5">
            <div>
              <Label
                htmlFor="mgr-pw"
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: "oklch(0.55 0.02 255)" }}
              >
                Access Code
              </Label>
              <Input
                id="mgr-pw"
                type="password"
                data-ocid="login.input"
                placeholder="Enter access code"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="mt-2 h-11 terminal-input"
              />
            </div>

            {error && (
              <div
                data-ocid="login.error_state"
                className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-md font-mono"
                style={{
                  background: "oklch(0.6 0.2 25 / 0.12)",
                  color: "oklch(0.72 0.18 25)",
                  border: "1px solid oklch(0.6 0.2 25 / 0.3)",
                }}
              >
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="button"
              data-ocid="login.submit_button"
              className="w-full h-11 rounded-md font-display font-bold text-sm tracking-wider uppercase btn-glow"
              onClick={handleLogin}
            >
              AUTHENTICATE
            </button>
          </div>

          <p
            className="text-xs text-center mt-5 font-mono"
            style={{ color: "oklch(0.32 0.02 255)" }}
          >
            Default: <span style={{ color: "oklch(0.45 0.03 240)" }}>1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Manager Portal ────────────────────────────────────────────────────────────
function ManagerPortal({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<Section>("register");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>(loadAttendance);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelStatus, setModelStatus] = useState(
    "Initializing biometric engine...",
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const consecutiveMatchRef = useRef<Record<string, number>>({});
  const [accessBanner, setAccessBanner] = useState<{
    name: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const waitForFaceApi = () =>
        new Promise<void>((resolve) => {
          const check = () => {
            if (typeof faceapi !== "undefined") resolve();
            else setTimeout(check, 200);
          };
          check();
        });
      try {
        await waitForFaceApi();
        const MODEL_URL =
          "https://justadudewhohacks.github.io/face-api.js/models";
        setModelStatus("Loading biometric models...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setModelStatus("BIOMETRIC ENGINE READY");
        toast.success("Biometric engine loaded");
      } catch {
        setModelStatus("ENGINE LOAD FAILED — Refresh");
        toast.error("Failed to load biometric models");
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        toast.error("Camera access denied");
      }
    };
    startCamera();
    return () => {
      if (streamRef.current)
        for (const t of streamRef.current.getTracks()) t.stop();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  const updateEmployees = (updated: Employee[]) => {
    setEmployees(updated);
    saveEmployees(updated);
  };

  const matchFace = useCallback(
    (descriptor: number[]): Employee | null => {
      let best: Employee | null = null;
      let minDist = 1;
      for (const emp of employees) {
        const dist = faceapi.euclideanDistance(descriptor, emp.face);
        if (dist < minDist) {
          minDist = dist;
          best = emp;
        }
      }
      return minDist < 0.4 ? best : null;
    },
    [employees],
  );

  const markAttendance = useCallback((emp: Employee) => {
    const today = new Date().toLocaleDateString();
    setAttendance((prev) => {
      const exists = prev.find((a) => a.id === emp.id && a.date === today);
      if (exists) return prev;
      const record: AttendanceRecord = {
        id: emp.id,
        name: emp.name,
        date: today,
        inTime: new Date().toLocaleTimeString(),
      };
      const updated = [...prev, record];
      saveAttendance(updated);
      setAccessBanner({ name: emp.name, time: record.inTime });
      setTimeout(() => setAccessBanner(null), 4500);
      try {
        new Audio(
          "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
        ).play();
      } catch {}
      return updated;
    });
  }, []);

  useEffect(() => {
    if (section !== "attendance" || !modelsLoaded) {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      return;
    }
    scanIntervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
        for (const det of detections) {
          const box = det.detection.box;
          // Draw glow rectangle
          ctx.shadowColor = "oklch(0.65 0.18 145)";
          ctx.shadowBlur = 10;
          ctx.strokeStyle = "#4ade80";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.shadowBlur = 0;
          const emp = matchFace(Array.from(det.descriptor));
          if (emp) {
            ctx.fillStyle = "#4ade80";
            ctx.font = "bold 13px 'General Sans', sans-serif";
            ctx.fillText(emp.name, box.x, box.y - 8);
            consecutiveMatchRef.current[emp.id] =
              (consecutiveMatchRef.current[emp.id] || 0) + 1;
            if (consecutiveMatchRef.current[emp.id] >= 2) {
              consecutiveMatchRef.current[emp.id] = 0;
              markAttendance(emp);
            }
          }
        }
      } catch {}
    }, 500);
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [section, modelsLoaded, matchFace, markAttendance]);

  type NavId = Section | "export-excel" | "export-pdf" | "logout";
  const navItems: { id: NavId; label: string; icon: React.ReactNode }[] = [
    {
      id: "register",
      label: "Register Employee",
      icon: <UserPlus className="w-4 h-4" />,
    },
    {
      id: "attendance",
      label: "Mark Attendance",
      icon: <Camera className="w-4 h-4" />,
    },
    {
      id: "employees",
      label: "Employees",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "calendar",
      label: "Attendance Log",
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "export-excel",
      label: "Export CSV",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: "export-pdf",
      label: "Export PDF",
      icon: <FileText className="w-4 h-4" />,
    },
    { id: "logout", label: "Sign Out", icon: <LogOut className="w-4 h-4" /> },
  ];

  const exportExcel = () => {
    const rows = ["Name,Employee ID,Type,Monthly Salary,Days Present"];
    for (const emp of employees) {
      const days = attendance.filter((a) => a.id === emp.id).length;
      rows.push(
        `${emp.name},${emp.id},${emp.type},${emp.monthlySalary},${days}`,
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "attendance.csv";
    a.click();
    toast.success("CSV exported successfully");
  };

  const exportPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("PAVITHRA EXPLOSIVES – Attendance Report", 14, 20);
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      let y = 44;
      doc.setFontSize(12);
      for (const emp of employees) {
        const days = attendance.filter((a) => a.id === emp.id).length;
        doc.text(`${emp.name}  (${emp.id})  —  ${days} days present`, 14, y);
        y += 10;
      }
      doc.save("attendance_report.pdf");
      toast.success("PDF exported successfully");
    } catch {
      toast.error("PDF export failed");
    }
  };

  const handleNav = (id: NavId) => {
    if (id === "logout") {
      onLogout();
      return;
    }
    if (id === "export-excel") {
      exportExcel();
      return;
    }
    if (id === "export-pdf") {
      exportPDF();
      return;
    }
    setSection(id as Section);
  };

  const sectionLabel =
    navItems.find((n) => n.id === section)?.label ?? "Dashboard";

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: "oklch(0.12 0.02 255)" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "oklch(0 0 0 / 0.6)" }}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[240px] flex flex-col flex-shrink-0 transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "oklch(0.10 0.02 255)",
          borderRight: "1px solid oklch(0.20 0.025 255)",
        }}
      >
        {/* Brand */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: "1px solid oklch(0.18 0.025 255)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-md shrink-0"
              style={{
                background: "oklch(0.65 0.2 240 / 0.15)",
                border: "1px solid oklch(0.65 0.2 240 / 0.3)",
              }}
            >
              <Shield
                className="w-4 h-4"
                style={{ color: "oklch(0.65 0.2 240)" }}
              />
            </div>
            <div>
              <p
                className="font-display font-bold text-xs leading-tight"
                style={{ color: "oklch(0.92 0.01 255)" }}
              >
                PAVITHRA EXPLOSIVES
              </p>
              <p
                className="text-xs font-mono"
                style={{ color: "oklch(0.40 0.02 255)", fontSize: "0.65rem" }}
              >
                MANAGER PORTAL
              </p>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid oklch(0.18 0.025 255)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${modelsLoaded ? "pulse-dot" : "pulse-blue"}`}
              style={{
                background: modelsLoaded
                  ? "oklch(0.65 0.18 145)"
                  : "oklch(0.75 0.15 60)",
                boxShadow: modelsLoaded
                  ? "0 0 6px oklch(0.65 0.18 145 / 0.8)"
                  : "0 0 6px oklch(0.75 0.15 60 / 0.8)",
              }}
            />
            <span
              className="text-xs font-mono"
              style={{
                color: modelsLoaded
                  ? "oklch(0.65 0.18 145)"
                  : "oklch(0.75 0.15 60)",
                fontSize: "0.68rem",
              }}
            >
              {modelStatus}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-auto">
          {navItems.map((item) => {
            const isActive = item.id === section;
            const isLogout = item.id === "logout";
            const isExport =
              item.id === "export-excel" || item.id === "export-pdf";
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${isLogout ? "button" : "link"}`}
                onClick={() => {
                  handleNav(item.id);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-sans font-medium transition-all"
                style={{
                  background: isActive
                    ? "oklch(0.65 0.2 240 / 0.12)"
                    : "transparent",
                  color: isActive
                    ? "oklch(0.65 0.2 240)"
                    : isLogout
                      ? "oklch(0.6 0.2 25)"
                      : isExport
                        ? "oklch(0.65 0.15 60)"
                        : "oklch(0.55 0.02 255)",
                  border: isActive
                    ? "1px solid oklch(0.65 0.2 240 / 0.2)"
                    : "1px solid transparent",
                }}
              >
                {item.icon}
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid oklch(0.18 0.025 255)" }}
        >
          <p
            className="text-xs font-mono"
            style={{ color: "oklch(0.30 0.02 255)", fontSize: "0.62rem" }}
          >
            © {new Date().getFullYear()}{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "oklch(0.40 0.03 240)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="h-13 flex items-center justify-between px-6 shrink-0"
          style={{
            background: "oklch(0.13 0.02 255)",
            borderBottom: "1px solid oklch(0.20 0.025 255)",
            height: 52,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-md mr-1 transition-colors"
              style={{ color: "oklch(0.65 0.2 240)" }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <Zap className="w-4 h-4" style={{ color: "oklch(0.65 0.2 240)" }} />
            <h1
              className="font-display font-bold text-sm tracking-wide"
              style={{ color: "oklch(0.92 0.01 255)" }}
            >
              {sectionLabel.toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:block">
              <LiveClock />
            </span>
            {modelsLoaded ? (
              <Badge
                className="text-xs font-mono px-2.5 py-0.5"
                style={{
                  background: "oklch(0.65 0.18 145 / 0.15)",
                  color: "oklch(0.65 0.18 145)",
                  border: "1px solid oklch(0.65 0.18 145 / 0.3)",
                }}
              >
                ● AI ACTIVE
              </Badge>
            ) : (
              <Badge
                className="text-xs font-mono px-2.5 py-0.5"
                style={{
                  background: "oklch(0.75 0.15 60 / 0.15)",
                  color: "oklch(0.75 0.15 60)",
                  border: "1px solid oklch(0.75 0.15 60 / 0.3)",
                }}
              >
                ◎ LOADING
              </Badge>
            )}
          </div>
        </header>

        {/* Access Granted Banner */}
        {accessBanner && (
          <div
            data-ocid="attendance.success_state"
            className="slide-down mx-6 mt-4 flex items-center gap-3 px-5 py-3 rounded-md"
            style={{
              background: "oklch(0.65 0.18 145 / 0.12)",
              border: "1px solid oklch(0.65 0.18 145 / 0.5)",
              color: "oklch(0.75 0.14 145)",
            }}
          >
            <CheckCircle2
              className="w-5 h-5 shrink-0"
              style={{ color: "oklch(0.65 0.18 145)" }}
            />
            <span className="font-display font-bold text-sm tracking-wide">
              ✓ ACCESS GRANTED — {accessBanner.name}
            </span>
            <span
              className="ml-auto text-xs font-mono"
              style={{ color: "oklch(0.55 0.02 255)" }}
            >
              IN TIME: {accessBanner.time}
            </span>
          </div>
        )}

        {/* Camera strip */}
        <div className="px-6 pt-4 shrink-0">
          <BiometricScanner
            videoRef={videoRef}
            canvasRef={canvasRef}
            modelStatus={modelStatus}
            modelsLoaded={modelsLoaded}
            isScanning={section === "attendance"}
          />
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {section === "register" && (
            <RegisterSection
              modelsLoaded={modelsLoaded}
              videoRef={videoRef}
              onSave={(emp) => updateEmployees([...employees, emp])}
            />
          )}
          {section === "attendance" && (
            <AttendanceStatus attendance={attendance} employees={employees} />
          )}
          {section === "employees" && (
            <EmployeesSection
              employees={employees}
              onUpdate={updateEmployees}
            />
          )}
          {section === "calendar" && (
            <CalendarSection attendance={attendance} />
          )}
          {section === "dashboard" && (
            <DashboardSection employees={employees} attendance={attendance} />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Biometric Scanner Card ────────────────────────────────────────────────────
function BiometricScanner({
  videoRef,
  canvasRef,
  modelStatus,
  modelsLoaded,
  isScanning,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  modelStatus: string;
  modelsLoaded: boolean;
  isScanning: boolean;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "oklch(0.10 0.02 255)",
        border: `1.5px solid ${isScanning ? "oklch(0.65 0.18 145 / 0.6)" : "oklch(0.20 0.025 255)"}`,
        boxShadow: isScanning ? "0 0 20px oklch(0.65 0.18 145 / 0.1)" : "none",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: "1px solid oklch(0.18 0.025 255)" }}
      >
        <div className="flex items-center gap-2.5">
          <Camera
            className="w-3.5 h-3.5"
            style={{
              color: isScanning
                ? "oklch(0.65 0.18 145)"
                : "oklch(0.45 0.02 255)",
            }}
          />
          <span
            className="text-xs font-mono tracking-widest uppercase"
            style={{
              color: isScanning
                ? "oklch(0.65 0.18 145)"
                : "oklch(0.45 0.02 255)",
            }}
          >
            {isScanning
              ? "BIOMETRIC SCANNER ACTIVE"
              : "CAMERA FEED — SYSTEM READY"}
          </span>
          {isScanning && (
            <div
              className="w-2 h-2 rounded-full pulse-dot"
              style={{
                background: "oklch(0.65 0.18 145)",
                boxShadow: "0 0 5px oklch(0.65 0.18 145)",
              }}
            />
          )}
        </div>
        <span
          className="text-xs font-mono"
          style={{
            color: modelsLoaded ? "oklch(0.55 0.03 240)" : "oklch(0.65 0.1 60)",
          }}
        >
          {modelStatus}
        </span>
      </div>

      {/* Feed */}
      <div
        className="relative"
        style={{ width: "100%", maxWidth: 440, height: 280 }}
      >
        {/* Corner brackets */}
        <div className="bracket-corner bracket-tl" />
        <div className="bracket-corner bracket-tr" />
        <div className="bracket-corner bracket-bl" />
        <div className="bracket-corner bracket-br" />
        {isScanning && <div className="scan-line" />}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            maxWidth: 440,
            height: 280,
            objectFit: "cover",
            display: "block",
          }}
        />
        <canvas
          ref={canvasRef}
          width={440}
          height={280}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            maxWidth: 440,
            height: 280,
          }}
        />
        {/* Overlay label */}
        <div
          className="absolute bottom-2 left-3 text-xs font-mono"
          style={{ color: "oklch(0.45 0.02 255 / 0.8)" }}
        >
          LIVE
        </div>
      </div>
    </div>
  );
}

// ── Register Section ──────────────────────────────────────────────────────────
function RegisterSection({
  modelsLoaded,
  videoRef,
  onSave,
}: {
  modelsLoaded: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSave: (emp: Employee) => void;
}) {
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [empType, setEmpType] = useState("Office");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [capturing, setCapturing] = useState(false);
  const [captureMsg, setCaptureMsg] = useState("");

  const perDay = monthlySalary
    ? (Number(monthlySalary) / 26).toFixed(2)
    : "0.00";

  const handleCapture = async () => {
    if (!name || !empId || !monthlySalary) {
      toast.error("Please fill all fields");
      return;
    }
    if (!modelsLoaded) {
      toast.error("Biometric engine not ready yet");
      return;
    }
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      toast.error("Camera not ready");
      return;
    }
    setCapturing(true);
    const samples: Float32Array[] = [];
    for (let i = 0; i < 5; i++) {
      setCaptureMsg(`Capturing sample ${i + 1} of 5...`);
      setProgress((i / 5) * 100);
      await new Promise((r) => setTimeout(r, 600));
      try {
        const det = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (!det) {
          toast.error(`Sample ${i + 1}: No face detected — face the camera`);
          setCapturing(false);
          setProgress(0);
          setCaptureMsg("");
          return;
        }
        samples.push(det.descriptor);
      } catch {
        toast.error("Detection error");
        setCapturing(false);
        setProgress(0);
        setCaptureMsg("");
        return;
      }
    }
    setCaptureMsg("Processing biometric data...");
    setProgress(95);
    const avg = new Float32Array(128);
    for (const s of samples) for (let j = 0; j < 128; j++) avg[j] += s[j] / 5;
    const emp: Employee = {
      name,
      id: empId,
      type: empType,
      monthlySalary: Number(monthlySalary),
      perDaySalary: Number.parseFloat(perDay),
      face: Array.from(avg),
    };
    onSave(emp);
    setProgress(100);
    toast.success(`${name} registered successfully`);
    setTimeout(() => {
      setName("");
      setEmpId("");
      setMonthlySalary("");
      setProgress(0);
      setCaptureMsg("");
      setCapturing(false);
    }, 800);
  };

  return (
    <div
      className="rounded-lg p-6 max-w-md"
      style={{
        background: "oklch(0.16 0.025 255)",
        border: "1px solid oklch(0.22 0.025 255)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <UserPlus
          className="w-5 h-5"
          style={{ color: "oklch(0.65 0.2 240)" }}
        />
        <h2
          className="font-display font-bold text-base"
          style={{ color: "oklch(0.92 0.01 255)" }}
        >
          REGISTER NEW EMPLOYEE
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "oklch(0.45 0.02 255)" }}
          >
            Full Name
          </Label>
          <Input
            data-ocid="register.input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 h-10 terminal-input"
          />
        </div>
        <div>
          <Label
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "oklch(0.45 0.02 255)" }}
          >
            Employee ID
          </Label>
          <Input
            data-ocid="register.input"
            placeholder="Employee ID"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            className="mt-1.5 h-10 terminal-input"
          />
        </div>
        <div>
          <Label
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "oklch(0.45 0.02 255)" }}
          >
            Department
          </Label>
          <Select value={empType} onValueChange={setEmpType}>
            <SelectTrigger
              data-ocid="register.select"
              className="mt-1.5 h-10 terminal-input"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "oklch(0.16 0.025 255)",
                border: "1px solid oklch(0.25 0.04 255)",
              }}
            >
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Driver">Driver</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
              <SelectItem value="Field">Field</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "oklch(0.45 0.02 255)" }}
          >
            Monthly Salary (₹)
          </Label>
          <Input
            data-ocid="register.input"
            type="number"
            placeholder="Monthly Salary"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            className="mt-1.5 h-10 terminal-input"
          />
          {monthlySalary && (
            <p
              className="text-xs mt-1.5 font-mono"
              style={{ color: "oklch(0.55 0.03 240)" }}
            >
              Per day: ₹{perDay}{" "}
              <span style={{ color: "oklch(0.38 0.02 255)" }}>
                (÷ 26 working days)
              </span>
            </p>
          )}
        </div>

        {capturing && (
          <div data-ocid="register.loading_state" className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-mono"
                style={{ color: "oklch(0.55 0.02 255)" }}
              >
                {captureMsg}
              </span>
              <span
                className="text-xs font-mono"
                style={{ color: "oklch(0.65 0.2 240)" }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <Progress
              value={progress}
              className="h-1.5"
              style={{ background: "oklch(0.20 0.025 255)" }}
            />
          </div>
        )}

        <button
          type="button"
          data-ocid="register.submit_button"
          className="w-full h-11 rounded-md font-display font-bold text-xs tracking-widest uppercase btn-glow"
          onClick={handleCapture}
          disabled={capturing || !modelsLoaded}
          style={{
            opacity: capturing || !modelsLoaded ? 0.5 : 1,
            cursor: capturing || !modelsLoaded ? "not-allowed" : "pointer",
          }}
        >
          {capturing ? "CAPTURING BIOMETRICS..." : "BEGIN FACE CAPTURE"}
        </button>
      </div>
    </div>
  );
}

// ── Attendance Status ─────────────────────────────────────────────────────────
function AttendanceStatus({
  attendance,
  employees,
}: { attendance: AttendanceRecord[]; employees: Employee[] }) {
  const today = new Date().toLocaleDateString();
  const todayRecords = attendance.filter((a) => a.date === today);
  const absent = employees.filter(
    (e) => !todayRecords.find((r) => r.id === e.id),
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg p-4 stat-card-green">
          <p
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "oklch(0.55 0.12 145)" }}
          >
            Present Today
          </p>
          <p
            className="text-4xl font-display font-bold mt-1"
            style={{ color: "oklch(0.72 0.15 145)" }}
          >
            {todayRecords.length}
          </p>
        </div>
        <div className="rounded-lg p-4 stat-card-red">
          <p
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "oklch(0.55 0.12 25)" }}
          >
            Absent Today
          </p>
          <p
            className="text-4xl font-display font-bold mt-1"
            style={{ color: "oklch(0.68 0.16 25)" }}
          >
            {absent.length}
          </p>
        </div>
      </div>

      {todayRecords.length > 0 ? (
        <div
          className="rounded-lg overflow-hidden table-dark"
          style={{ border: "1px solid oklch(0.20 0.025 255)" }}
        >
          <div
            className="px-4 py-2.5"
            style={{
              background: "oklch(0.14 0.025 255)",
              borderBottom: "1px solid oklch(0.20 0.025 255)",
            }}
          >
            <p
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "oklch(0.45 0.02 255)" }}
            >
              Today's Verified Check-ins
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="font-mono text-xs"
                  style={{ color: "oklch(0.55 0.02 255)" }}
                >
                  Name
                </TableHead>
                <TableHead
                  className="font-mono text-xs"
                  style={{ color: "oklch(0.55 0.02 255)" }}
                >
                  Employee ID
                </TableHead>
                <TableHead
                  className="font-mono text-xs"
                  style={{ color: "oklch(0.55 0.02 255)" }}
                >
                  In Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayRecords.map((r, i) => (
                <TableRow
                  key={r.id + r.date}
                  data-ocid={`attendance.item.${i + 1}`}
                >
                  <TableCell
                    className="font-sans text-sm"
                    style={{ color: "oklch(0.88 0.01 255)" }}
                  >
                    {r.name}
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.55 0.02 255)" }}
                  >
                    {r.id}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs font-mono px-2 py-1 rounded"
                      style={{
                        background: "oklch(0.65 0.18 145 / 0.15)",
                        color: "oklch(0.65 0.18 145)",
                        border: "1px solid oklch(0.65 0.18 145 / 0.3)",
                      }}
                    >
                      {r.inTime}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div
          data-ocid="attendance.empty_state"
          className="rounded-lg p-10 text-center"
          style={{
            border: "1px dashed oklch(0.25 0.03 255)",
            background: "oklch(0.14 0.02 255)",
          }}
        >
          <Camera
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.28 0.03 255)" }}
          />
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "oklch(0.40 0.02 255)" }}
          >
            No check-ins detected today
          </p>
          <p
            className="text-xs mt-1.5 font-sans"
            style={{ color: "oklch(0.35 0.02 255)" }}
          >
            Face the scanner to mark attendance automatically
          </p>
        </div>
      )}
    </div>
  );
}

// ── Employees Section ─────────────────────────────────────────────────────────
function EmployeesSection({
  employees,
  onUpdate,
}: { employees: Employee[]; onUpdate: (u: Employee[]) => void }) {
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setEditForm({ ...emp });
  };
  const saveEdit = () => {
    if (!editTarget) return;
    const updated = employees.map((e) =>
      e.id === editTarget.id
        ? {
            ...e,
            ...editForm,
            perDaySalary:
              Number(editForm.monthlySalary || e.monthlySalary) / 26,
          }
        : e,
    );
    onUpdate(updated);
    setEditTarget(null);
    toast.success("Employee record updated");
  };
  const deleteEmployee = (id: string) => {
    onUpdate(employees.filter((e) => e.id !== id));
    toast.success("Employee removed");
  };

  return (
    <div>
      {employees.length === 0 ? (
        <div
          data-ocid="employees.empty_state"
          className="rounded-lg p-10 text-center"
          style={{
            border: "1px dashed oklch(0.25 0.03 255)",
            background: "oklch(0.14 0.02 255)",
          }}
        >
          <Users
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.28 0.03 255)" }}
          />
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "oklch(0.40 0.02 255)" }}
          >
            No employees registered
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden table-dark"
          style={{ border: "1px solid oklch(0.20 0.025 255)" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Name",
                  "ID",
                  "Department",
                  "Monthly Salary",
                  "Per Day",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.50 0.02 255)" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp, i) => (
                <TableRow key={emp.id} data-ocid={`employees.item.${i + 1}`}>
                  <TableCell
                    className="font-sans font-medium text-sm"
                    style={{ color: "oklch(0.90 0.01 255)" }}
                  >
                    {emp.name}
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.55 0.03 240)" }}
                  >
                    {emp.id}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        background: "oklch(0.65 0.2 240 / 0.12)",
                        color: "oklch(0.65 0.2 240)",
                        border: "1px solid oklch(0.65 0.2 240 / 0.2)",
                      }}
                    >
                      {emp.type}
                    </span>
                  </TableCell>
                  <TableCell
                    className="font-mono text-sm"
                    style={{ color: "oklch(0.80 0.01 255)" }}
                  >
                    ₹{emp.monthlySalary.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.55 0.02 255)" }}
                  >
                    ₹{emp.perDaySalary.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        data-ocid={`employees.edit_button.${i + 1}`}
                        onClick={() => openEdit(emp)}
                        className="p-1.5 rounded transition-colors"
                        style={{
                          background: "oklch(0.65 0.2 240 / 0.1)",
                          color: "oklch(0.65 0.2 240)",
                          border: "1px solid oklch(0.65 0.2 240 / 0.2)",
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        data-ocid={`employees.delete_button.${i + 1}`}
                        onClick={() => deleteEmployee(emp.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{
                          background: "oklch(0.6 0.2 25 / 0.1)",
                          color: "oklch(0.6 0.2 25)",
                          border: "1px solid oklch(0.6 0.2 25 / 0.2)",
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent
          data-ocid="employees.dialog"
          style={{
            background: "oklch(0.16 0.025 255)",
            border: "1px solid oklch(0.25 0.04 255)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-display"
              style={{ color: "oklch(0.92 0.01 255)" }}
            >
              Edit Employee Record
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: "oklch(0.45 0.02 255)" }}
              >
                Full Name
              </Label>
              <Input
                data-ocid="employees.input"
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="mt-1.5 terminal-input"
              />
            </div>
            <div>
              <Label
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: "oklch(0.45 0.02 255)" }}
              >
                Department
              </Label>
              <Select
                value={editForm.type || "Office"}
                onValueChange={(v) => setEditForm({ ...editForm, type: v })}
              >
                <SelectTrigger
                  data-ocid="employees.select"
                  className="mt-1.5 terminal-input"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.16 0.025 255)",
                    border: "1px solid oklch(0.25 0.04 255)",
                  }}
                >
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Driver">Driver</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Field">Field</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: "oklch(0.45 0.02 255)" }}
              >
                Monthly Salary (₹)
              </Label>
              <Input
                data-ocid="employees.input"
                type="number"
                value={editForm.monthlySalary || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    monthlySalary: Number(e.target.value),
                  })
                }
                className="mt-1.5 terminal-input"
              />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button
                data-ocid="employees.cancel_button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                style={{
                  borderColor: "oklch(0.25 0.04 255)",
                  color: "oklch(0.60 0.02 255)",
                }}
              >
                Cancel
              </Button>
              <button
                type="button"
                data-ocid="employees.save_button"
                className="px-4 py-2 rounded-md font-display font-bold text-sm btn-glow"
                onClick={saveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Calendar Section ──────────────────────────────────────────────────────────
function CalendarSection({ attendance }: { attendance: AttendanceRecord[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const months = [
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

  const filtered = attendance.filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Select
          value={String(month)}
          onValueChange={(v) => setMonth(Number(v))}
        >
          <SelectTrigger
            data-ocid="calendar.select"
            className="w-36 terminal-input h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              background: "oklch(0.16 0.025 255)",
              border: "1px solid oklch(0.25 0.04 255)",
            }}
          >
            {months.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger
            data-ocid="calendar.select"
            className="w-24 terminal-input h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              background: "oklch(0.16 0.025 255)",
              border: "1px solid oklch(0.25 0.04 255)",
            }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span
          className="text-xs font-mono"
          style={{ color: "oklch(0.45 0.02 255)" }}
        >
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="calendar.empty_state"
          className="rounded-lg p-10 text-center"
          style={{
            border: "1px dashed oklch(0.25 0.03 255)",
            background: "oklch(0.14 0.02 255)",
          }}
        >
          <CalendarDays
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.28 0.03 255)" }}
          />
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "oklch(0.40 0.02 255)" }}
          >
            No records for {months[month - 1]} {year}
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden table-dark"
          style={{ border: "1px solid oklch(0.20 0.025 255)" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {["Name", "Employee ID", "Date", "In Time"].map((h) => (
                  <TableHead
                    key={h}
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.50 0.02 255)" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, idx) => (
                <TableRow
                  key={r.id + r.date}
                  data-ocid={`calendar.item.${idx + 1}`}
                >
                  <TableCell
                    className="font-sans text-sm"
                    style={{ color: "oklch(0.88 0.01 255)" }}
                  >
                    {r.name}
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.55 0.03 240)" }}
                  >
                    {r.id}
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.60 0.02 255)" }}
                  >
                    {r.date}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        background: "oklch(0.65 0.18 145 / 0.15)",
                        color: "oklch(0.65 0.18 145)",
                        border: "1px solid oklch(0.65 0.18 145 / 0.3)",
                      }}
                    >
                      {r.inTime}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Dashboard Section ─────────────────────────────────────────────────────────
function DashboardSection({
  employees,
  attendance,
}: { employees: Employee[]; attendance: AttendanceRecord[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const today = new Date().toLocaleDateString();
  const presentToday = attendance.filter((a) => a.date === today).length;
  const absentToday = Math.max(0, employees.length - presentToday);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas || typeof Chart === "undefined") return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    chartInstanceRef.current = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Present", "Absent"],
        datasets: [
          {
            data: [presentToday || 0, absentToday || 1],
            backgroundColor: ["#4ade80", "#f87171"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#9ca3af",
              font: { family: "General Sans", size: 12 },
              padding: 16,
            },
          },
        },
        cutout: "68%",
      },
    });
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [presentToday, absentToday]);

  const stats = [
    {
      label: "Total Employees",
      value: employees.length,
      cls: "stat-card-blue",
      color: "oklch(0.65 0.2 240)",
    },
    {
      label: "Present Today",
      value: presentToday,
      cls: "stat-card-green",
      color: "oklch(0.65 0.18 145)",
    },
    {
      label: "Absent Today",
      value: absentToday,
      cls: "stat-card-red",
      color: "oklch(0.65 0.18 25)",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 max-w-lg">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-lg p-4 ${s.cls}`}>
            <p
              className="text-xs font-mono uppercase tracking-widest"
              style={{ color: s.color, opacity: 0.7 }}
            >
              {s.label}
            </p>
            <p
              className="text-4xl font-display font-bold mt-1"
              style={{ color: s.color }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-lg p-5 inline-block"
        style={{
          background: "oklch(0.16 0.025 255)",
          border: "1px solid oklch(0.22 0.025 255)",
        }}
      >
        <p
          className="font-mono text-xs uppercase tracking-widest mb-4"
          style={{ color: "oklch(0.45 0.02 255)" }}
        >
          Today's Distribution
        </p>
        <canvas
          ref={chartRef}
          width={240}
          height={240}
          data-ocid="dashboard.chart_point"
        />
      </div>

      {employees.length > 0 && (
        <div
          className="rounded-lg overflow-hidden table-dark max-w-2xl"
          style={{ border: "1px solid oklch(0.20 0.025 255)" }}
        >
          <div
            className="px-4 py-2.5"
            style={{
              background: "oklch(0.14 0.025 255)",
              borderBottom: "1px solid oklch(0.20 0.025 255)",
            }}
          >
            <p
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "oklch(0.45 0.02 255)" }}
            >
              Employee Summary
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {["Name", "Days Present", "Earned Salary"].map((h) => (
                  <TableHead
                    key={h}
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.50 0.02 255)" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp, i) => {
                const days = attendance.filter((a) => a.id === emp.id).length;
                const earned = days * emp.perDaySalary;
                return (
                  <TableRow key={emp.id} data-ocid={`dashboard.item.${i + 1}`}>
                    <TableCell
                      className="font-sans text-sm"
                      style={{ color: "oklch(0.88 0.01 255)" }}
                    >
                      {emp.name}
                    </TableCell>
                    <TableCell
                      className="font-mono text-sm"
                      style={{ color: "oklch(0.65 0.18 145)" }}
                    >
                      {days}
                    </TableCell>
                    <TableCell
                      className="font-mono text-sm"
                      style={{ color: "oklch(0.80 0.01 255)" }}
                    >
                      ₹
                      {earned.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Employee Login ────────────────────────────────────────────────────────────
function EmployeeLoginPage({
  onLogin,
  onBack,
}: { onLogin: (emp: Employee) => void; onBack: () => void }) {
  const [empId, setEmpId] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const employees = loadEmployees();
    const found = employees.find((e) => e.id.trim() === empId.trim());
    if (found) {
      onLogin(found);
    } else {
      setError("Employee ID not found. Please contact your manager.");
    }
  };

  return (
    <div className="min-h-screen dot-grid flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <button
          type="button"
          data-ocid="employee-login.back_button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: "oklch(0.45 0.02 255)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "oklch(0.65 0.18 145)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "oklch(0.45 0.02 255)";
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Portal
        </button>

        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
            style={{
              background: "oklch(0.65 0.18 145 / 0.12)",
              border: "1.5px solid oklch(0.65 0.18 145 / 0.35)",
              boxShadow: "0 0 28px oklch(0.65 0.18 145 / 0.15)",
            }}
          >
            <User
              className="w-8 h-8"
              style={{ color: "oklch(0.65 0.18 145)" }}
            />
          </div>
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: "oklch(0.97 0.01 255)" }}
          >
            EMPLOYEE PORTAL
          </h1>
          <p
            className="text-xs mt-1.5 tracking-widest uppercase font-mono"
            style={{ color: "oklch(0.45 0.02 255)" }}
          >
            Enter your Employee ID
          </p>
        </div>

        <div
          className="rounded-lg p-7"
          style={{
            background: "oklch(0.16 0.025 255)",
            border: "1px solid oklch(0.22 0.025 255)",
          }}
        >
          <div className="space-y-5">
            <div>
              <Label
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: "oklch(0.55 0.02 255)" }}
              >
                Employee ID
              </Label>
              <Input
                data-ocid="employee-login.input"
                placeholder="Employee ID"
                value={empId}
                onChange={(e) => {
                  setEmpId(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="mt-2 h-11 terminal-input"
              />
            </div>
            {error && (
              <div
                data-ocid="employee-login.error_state"
                className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-md font-mono"
                style={{
                  background: "oklch(0.6 0.2 25 / 0.12)",
                  color: "oklch(0.72 0.18 25)",
                  border: "1px solid oklch(0.6 0.2 25 / 0.3)",
                }}
              >
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="button"
              data-ocid="employee-login.submit_button"
              className="w-full h-11 rounded-md font-display font-bold text-sm tracking-wider uppercase"
              onClick={handleLogin}
              style={{
                background: "oklch(0.65 0.18 145)",
                color: "oklch(0.10 0.01 255)",
                boxShadow: "0 0 18px oklch(0.65 0.18 145 / 0.3)",
              }}
            >
              ACCESS PORTAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Employee Dashboard ────────────────────────────────────────────────────────
function EmployeeDashboard({
  employee,
  onBack,
}: { employee: Employee; onBack: () => void }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const months = [
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

  const allAttendance = loadAttendance();
  const filtered = allAttendance.filter((a) => {
    if (a.id !== employee.id) return false;
    const d = new Date(a.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  const _daysInMonth = new Date(year, month, 0).getDate();
  const workingDays = 26;
  const daysPresent = filtered.length;
  const daysAbsent = Math.max(0, workingDays - daysPresent);
  const earnedSalary = daysPresent * employee.perDaySalary;

  const portalStats = [
    {
      label: "Days Present",
      value: daysPresent,
      cls: "stat-card-green",
      color: "oklch(0.65 0.18 145)",
    },
    {
      label: "Days Absent",
      value: daysAbsent,
      cls: "stat-card-red",
      color: "oklch(0.65 0.18 25)",
    },
    {
      label: "Monthly Salary",
      value: `₹${employee.monthlySalary.toLocaleString()}`,
      cls: "stat-card-blue",
      color: "oklch(0.65 0.2 240)",
    },
    {
      label: "Per Day Salary",
      value: `₹${employee.perDaySalary.toFixed(2)}`,
      cls: "stat-card-blue",
      color: "oklch(0.65 0.2 240)",
    },
    {
      label: "Earned This Month",
      value: `₹${earnedSalary.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      cls: "stat-card-amber",
      color: "oklch(0.75 0.15 60)",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.12 0.02 255)" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: "oklch(0.13 0.02 255)",
          borderBottom: "1px solid oklch(0.20 0.025 255)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            data-ocid="employee-portal.back_button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "oklch(0.45 0.02 255)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                "oklch(0.65 0.18 145)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                "oklch(0.45 0.02 255)";
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div
            className="w-px h-5"
            style={{ background: "oklch(0.22 0.025 255)" }}
          />
          <div>
            <p
              className="font-display font-bold text-sm"
              style={{ color: "oklch(0.92 0.01 255)" }}
            >
              EMPLOYEE PORTAL
            </p>
            <p
              className="text-xs font-mono"
              style={{ color: "oklch(0.55 0.03 240)" }}
            >
              {employee.name} · {employee.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <span
            className="text-xs font-mono px-2.5 py-1 rounded"
            style={{
              background: "oklch(0.65 0.18 145 / 0.12)",
              color: "oklch(0.65 0.18 145)",
              border: "1px solid oklch(0.65 0.18 145 / 0.3)",
            }}
          >
            {employee.type}
          </span>
        </div>
      </header>

      <div className="px-6 py-6 max-w-5xl">
        {/* Month filter */}
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays
            className="w-4 h-4"
            style={{ color: "oklch(0.45 0.02 255)" }}
          />
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger
              data-ocid="employee-portal.select"
              className="w-36 terminal-input h-9"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "oklch(0.16 0.025 255)",
                border: "1px solid oklch(0.25 0.04 255)",
              }}
            >
              {months.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger
              data-ocid="employee-portal.select"
              className="w-24 terminal-input h-9"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "oklch(0.16 0.025 255)",
                border: "1px solid oklch(0.25 0.04 255)",
              }}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span
            className="text-xs font-mono"
            style={{ color: "oklch(0.40 0.02 255)" }}
          >
            {months[month - 1]} {year}
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {portalStats.map((s) => (
            <div key={s.label} className={`rounded-lg p-4 ${s.cls}`}>
              <p
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: s.color, opacity: 0.7 }}
              >
                {s.label}
              </p>
              <p
                className="text-2xl font-display font-bold mt-1.5"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Attendance history */}
        {filtered.length === 0 ? (
          <div
            data-ocid="employee-portal.empty_state"
            className="rounded-lg p-10 text-center"
            style={{
              border: "1px dashed oklch(0.25 0.03 255)",
              background: "oklch(0.14 0.02 255)",
            }}
          >
            <CalendarDays
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "oklch(0.28 0.03 255)" }}
            />
            <p
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "oklch(0.40 0.02 255)" }}
            >
              No attendance records for {months[month - 1]} {year}
            </p>
          </div>
        ) : (
          <div
            className="rounded-lg overflow-hidden table-dark"
            style={{ border: "1px solid oklch(0.20 0.025 255)" }}
          >
            <div
              className="px-4 py-2.5"
              style={{
                background: "oklch(0.14 0.025 255)",
                borderBottom: "1px solid oklch(0.20 0.025 255)",
              }}
            >
              <p
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: "oklch(0.45 0.02 255)" }}
              >
                Attendance History — {months[month - 1]} {year}
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {["Date", "In Time", "Status"].map((h) => (
                    <TableHead
                      key={h}
                      className="font-mono text-xs"
                      style={{ color: "oklch(0.50 0.02 255)" }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r, i) => (
                  <TableRow
                    key={r.id + r.date}
                    data-ocid={`employee-portal.item.${i + 1}`}
                  >
                    <TableCell
                      className="font-mono text-sm"
                      style={{ color: "oklch(0.75 0.01 255)" }}
                    >
                      {r.date}
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{
                          background: "oklch(0.65 0.18 145 / 0.15)",
                          color: "oklch(0.65 0.18 145)",
                          border: "1px solid oklch(0.65 0.18 145 / 0.3)",
                        }}
                      >
                        {r.inTime}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1 w-fit"
                        style={{
                          background: "oklch(0.65 0.18 145 / 0.12)",
                          color: "oklch(0.65 0.18 145)",
                          border: "1px solid oklch(0.65 0.18 145 / 0.25)",
                        }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        PRESENT
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 mt-8 status-bar">
        <p
          className="text-xs font-mono"
          style={{ color: "oklch(0.35 0.02 255)" }}
        >
          {`© ${new Date().getFullYear()} PAVITHRA EXPLOSIVES · Built with love using `}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "oklch(0.45 0.03 240)" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
