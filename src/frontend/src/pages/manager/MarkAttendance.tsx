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
import {
  CheckCircle,
  Clock,
  Loader2,
  ScanFace,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCamera } from "../../camera/useCamera";
import {
  detectFaceWithBox,
  euclideanDistance,
  useFaceApi,
} from "../../hooks/useFaceApi";
import {
  formatDate,
  todayString,
  useAddAttendance,
  useAttendanceByDate,
  useEmployees,
} from "../../hooks/useQueries";
import type { Employee } from "../../hooks/useQueries";

type ScanState = "idle" | "scanning" | "matched" | "no-match";

export default function MarkAttendance() {
  const today = todayString();
  const { isLoaded, error: apiError, progress } = useFaceApi();
  const { videoRef, canvasRef, isActive, startCamera, stopCamera } = useCamera({
    facingMode: "user",
  });
  const { data: employees } = useEmployees();
  const { data: todayAttendance, isLoading: attLoading } =
    useAttendanceByDate(today);
  const addAttendance = useAddAttendance();

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [matchedEmployee, setMatchedEmployee] = useState<Employee | null>(null);
  const [marking, setMarking] = useState(false);
  const [markedTime, setMarkedTime] = useState<string | null>(null);
  const [alreadyCheckedTime, setAlreadyCheckedTime] = useState<string | null>(
    null,
  );
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const matchCountRef = useRef(0);
  const autoMarkingRef = useRef(false);

  useEffect(
    () => () => {
      if (loopRef.current) clearTimeout(loopRef.current);
      stopCamera();
    },
    [stopCamera],
  );

  const drawOverlay = useCallback(
    (box: any | null, color: string) => {
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
      const seg = Math.min(mw, mh) * 0.3;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 16;
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

  const handleMarkPresent = useCallback(
    async (
      employee: Employee,
      alreadyMarked: boolean,
      existingNote?: string,
    ) => {
      if (alreadyMarked) {
        // Extract time from existing note if it looks like a time string
        const timeMatch = existingNote?.match(/\d{1,2}:\d{2}\s?[AP]M/i);
        setAlreadyCheckedTime(timeMatch ? timeMatch[0] : "earlier today");
        return;
      }
      setMarking(true);
      try {
        const checkInTime = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        await addAttendance.mutateAsync({
          employeeId: employee.employeeId,
          date: today,
          status: "present",
          note: checkInTime,
        });
        setMarkedTime(checkInTime);
        toast.success(`${employee.name} marked present at ${checkInTime}!`);
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to mark attendance.");
        setScanState("idle");
      } finally {
        setMarking(false);
      }
    },
    [addAttendance, today],
  );

  const runLoop = useCallback(async () => {
    if (!isLoaded || !videoRef.current || !isActive) return;

    const detection = await detectFaceWithBox(videoRef.current);

    if (!detection) {
      drawOverlay(null, "#3b82f6");
      matchCountRef.current = 0;
      loopRef.current = setTimeout(runLoop, 400);
      return;
    }

    const descriptor = Array.from(detection.descriptor as Float32Array);
    let bestMatch: Employee | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const emp of employees ?? []) {
      if (!emp.faceDescriptor) continue;
      try {
        const stored = JSON.parse(emp.faceDescriptor) as number[];
        const dist = euclideanDistance(descriptor, stored);
        if (dist < 0.52 && dist < bestDist) {
          bestDist = dist;
          bestMatch = emp;
        }
      } catch {
        /* skip */
      }
    }

    if (bestMatch) {
      drawOverlay(detection.detection.box, "#22c55e");
      matchCountRef.current += 1;
      if (matchCountRef.current >= 2 && !autoMarkingRef.current) {
        autoMarkingRef.current = true;
        setMatchedEmployee(bestMatch);
        setScanState("matched");
        if (loopRef.current) clearTimeout(loopRef.current);
        stopCamera();
        toast.success(`Identity confirmed: ${bestMatch.name}`);

        // Auto-mark attendance
        const alreadyMarked = !!todayAttendance?.some(
          (a) => a.employeeId === bestMatch!.employeeId,
        );
        const existingRecord = todayAttendance?.find(
          (a) => a.employeeId === bestMatch!.employeeId,
        );
        await handleMarkPresent(bestMatch, alreadyMarked, existingRecord?.note);
        return;
      }
    } else {
      drawOverlay(detection.detection.box, "#f59e0b");
      matchCountRef.current = 0;
    }

    loopRef.current = setTimeout(runLoop, 300);
  }, [
    isLoaded,
    isActive,
    videoRef,
    employees,
    drawOverlay,
    stopCamera,
    todayAttendance,
    handleMarkPresent,
  ]);

  useEffect(() => {
    if (scanState === "scanning" && isActive && isLoaded) {
      loopRef.current = setTimeout(runLoop, 400);
    }
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [scanState, isActive, isLoaded, runLoop]);

  const handleStart = async () => {
    setMatchedEmployee(null);
    setMarkedTime(null);
    setAlreadyCheckedTime(null);
    matchCountRef.current = 0;
    autoMarkingRef.current = false;
    setScanState("scanning");
    await startCamera();
  };

  const handleStop = () => {
    if (loopRef.current) clearTimeout(loopRef.current);
    stopCamera();
    setScanState("idle");
    setMatchedEmployee(null);
    autoMarkingRef.current = false;
  };

  // Helper to extract time from note field
  const getTimeFromNote = (note: string | undefined): string => {
    if (!note) return "—";
    const timeMatch = note.match(/\d{1,2}:\d{2}\s?[AP]M/i);
    return timeMatch ? timeMatch[0] : note;
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-3">
          <ScanFace className="w-7 h-7 text-primary" />
          Mark Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Today:{" "}
          <span className="text-foreground font-medium">
            {formatDate(today)}
          </span>
        </p>
      </div>

      {/* Main scanner area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Camera */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-primary" />
              Face Scanner
            </CardTitle>
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
                data-ocid="attendance.face-api.error_state"
                className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2"
              >
                {apiError}
              </div>
            )}

            {/* Camera viewport */}
            <div
              className="relative rounded-xl overflow-hidden bg-black"
              style={{ aspectRatio: "4/3" }}
            >
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
              <canvas ref={canvasRef} className="hidden" />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <div className="w-24 h-32 rounded-[50%] border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <ScanFace className="w-10 h-10 opacity-30" />
                  </div>
                  <p className="text-xs">Ready to scan</p>
                </div>
              )}

              {/* Corner decorations */}
              {isActive && (
                <>
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-white/20" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-white/20" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-white/20" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-white/20" />
                </>
              )}

              {/* Scan state overlay */}
              {scanState === "scanning" && isActive && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-black/60 text-blue-400 text-xs px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Scanning...
                  </span>
                </div>
              )}
            </div>

            {/* Instruction */}
            {scanState === "scanning" && (
              <p className="text-xs text-center text-muted-foreground">
                Look directly at the camera. Attendance will be marked
                automatically.
              </p>
            )}

            {/* Button */}
            {scanState === "idle" ? (
              <Button
                data-ocid="attendance.start-scan.button"
                className="w-full"
                onClick={handleStart}
                disabled={!isLoaded}
              >
                <ScanFace className="w-4 h-4 mr-2" />
                {isLoaded ? "Start Face Scan" : "Loading..."}
              </Button>
            ) : scanState === "scanning" ? (
              <Button
                data-ocid="attendance.stop-scan.button"
                variant="outline"
                className="w-full"
                onClick={handleStop}
              >
                Stop Scanning
              </Button>
            ) : (
              <Button
                data-ocid="attendance.scan-again.button"
                variant="outline"
                className="w-full"
                onClick={handleStart}
              >
                Scan Next Person
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">
              Recognition Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanState === "matched" && matchedEmployee ? (
              <div className="space-y-4">
                {marking ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Marking attendance...
                    </p>
                  </div>
                ) : alreadyCheckedTime ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl font-bold text-amber-400">
                        {matchedEmployee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-lg">
                          {matchedEmployee.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {matchedEmployee.department}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {matchedEmployee.employeeId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-300 font-medium">
                        Already checked in today at {alreadyCheckedTime}
                      </span>
                    </div>
                  </div>
                ) : markedTime ? (
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl font-bold text-green-400">
                        {matchedEmployee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-lg">
                          {matchedEmployee.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {matchedEmployee.department}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {matchedEmployee.employeeId}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-300 font-semibold">
                        Attendance marked at {markedTime}
                      </span>
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      ✓ Check-in recorded successfully
                    </div>
                  </div>
                ) : null}
              </div>
            ) : scanState === "no-match" ? (
              <div
                data-ocid="attendance.no-match.error_state"
                className="flex flex-col items-center justify-center py-10 gap-3"
              >
                <XCircle className="w-12 h-12 text-red-400" />
                <p className="text-sm font-medium text-foreground">
                  Face not recognized
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  This person is not registered in the system.
                </p>
              </div>
            ) : (
              <div
                data-ocid="attendance.result.empty_state"
                className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground"
              >
                <ScanFace className="w-14 h-14 opacity-20" />
                <p className="text-sm">Awaiting face scan</p>
                <p className="text-xs text-center">
                  Start the scanner — attendance marks automatically on match
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Today's Attendance Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {attLoading ? (
            <div
              data-ocid="attendance.today-list.loading_state"
              className="p-4 space-y-2"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !todayAttendance?.length ? (
            <div
              data-ocid="attendance.today-list.empty_state"
              className="p-8 text-center text-muted-foreground text-sm"
            >
              No attendance marked yet for today.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-In Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAttendance.map((rec, idx) => (
                  <TableRow
                    key={rec.id}
                    data-ocid={`attendance.today.row.${idx + 1}`}
                  >
                    <TableCell className="font-medium">
                      {rec.employeeId}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/15 text-green-400 border border-green-500/30">
                        {rec.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground font-medium">
                      {getTimeFromNote(rec.note)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
