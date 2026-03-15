import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";
import { euclideanDistance, useFaceApi } from "../hooks/useFaceApi";

interface FaceScannerProps {
  mode: "register" | "attendance";
  employees?: Array<{
    employeeId: string;
    name: string;
    department: string;
    faceDescriptor?: string | null;
  }>;
  onFaceCapture?: (descriptor: string) => void;
  onFaceMatch?: (employeeId: string) => void;
  className?: string;
}

type ScanState =
  | "idle"
  | "starting"
  | "scanning"
  | "detected"
  | "matched"
  | "no-match";

export default function FaceScanner({
  mode,
  employees,
  onFaceCapture,
  onFaceMatch,
  className,
}: FaceScannerProps) {
  const { isLoaded, error: apiError, progress } = useFaceApi();
  const { videoRef, canvasRef, isActive, isLoading, startCamera, stopCamera } =
    useCamera({ facingMode: "user" });
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [matchedName, setMatchedName] = useState("");
  const [faceBox, setFaceBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    scanIntervalRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stopScanning();
      stopCamera();
    },
    [stopScanning, stopCamera],
  );

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.clientWidth || 320;
    canvas.height = video.clientHeight || 240;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!faceBox) return;
    const { x, y, w, h } = faceBox;
    const color =
      scanState === "detected" || scanState === "matched"
        ? "#22c55e"
        : "#3b82f6";
    const lineLen = Math.min(w, h) * 0.25;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    const corners: [number, number, number, number, number, number][] = [
      [x, y, x + lineLen, y, x, y + lineLen],
      [x + w - lineLen, y, x + w, y, x + w, y + lineLen],
      [x, y + h - lineLen, x, y + h, x + lineLen, y + h],
      [x + w, y + h - lineLen, x + w, y + h, x + w - lineLen, y + h],
    ];
    for (const [x1, y1, x2, y2, x3, y3] of corners) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    }
  }, [faceBox, scanState, videoRef]);

  const runDetection = useCallback(async () => {
    if (!isLoaded || !videoRef.current || !isActive) return;
    const faceapi = (window as any).faceapi;
    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection) {
        setFaceBox(null);
        setScanState("scanning");
        setStatusMsg("Position your face in front of the camera");
        return;
      }
      const { box } = detection.detection;
      const video = videoRef.current;
      const scaleX = (video.clientWidth || 320) / (video.videoWidth || 320);
      const scaleY = (video.clientHeight || 240) / (video.videoHeight || 240);
      const mirroredX =
        (video.clientWidth || 320) - (box.x + box.width) * scaleX;
      setFaceBox({
        x: mirroredX,
        y: box.y * scaleY,
        w: box.width * scaleX,
        h: box.height * scaleY,
      });
      const descriptor = Array.from(detection.descriptor as Float32Array);
      if (mode === "register") {
        setScanState("detected");
        setStatusMsg("Face detected! Click Capture to save");
        stopScanning();
        onFaceCapture?.(JSON.stringify(descriptor));
      } else if (mode === "attendance" && employees?.length) {
        let bestMatch: (typeof employees)[0] | null = null;
        let bestDist = Number.POSITIVE_INFINITY;
        for (const emp of employees) {
          if (!emp.faceDescriptor) continue;
          try {
            const stored = JSON.parse(emp.faceDescriptor) as number[];
            const dist = euclideanDistance(descriptor, stored);
            if (dist < 0.55 && dist < bestDist) {
              bestDist = dist;
              bestMatch = emp;
            }
          } catch {
            /* skip */
          }
        }
        if (bestMatch) {
          setScanState("matched");
          setMatchedName(bestMatch.name);
          setStatusMsg(`Recognized: ${bestMatch.name}`);
          stopScanning();
          onFaceMatch?.(bestMatch.employeeId);
        } else {
          setScanState("detected");
          setStatusMsg("Face detected — not recognized");
        }
      }
    } catch {
      /* silent */
    }
  }, [
    isLoaded,
    isActive,
    videoRef,
    mode,
    employees,
    onFaceCapture,
    onFaceMatch,
    stopScanning,
  ]);

  const handleStart = async () => {
    setScanState("starting");
    setStatusMsg("Starting camera...");
    setFaceBox(null);
    setMatchedName("");
    await startCamera();
    setScanState("scanning");
    setStatusMsg("Position your face in the frame");
    scanIntervalRef.current = setInterval(runDetection, 500);
  };

  const handleStop = () => {
    stopScanning();
    stopCamera();
    setScanState("idle");
    setStatusMsg("");
    setFaceBox(null);
    setMatchedName("");
  };

  const stateColor = {
    idle: "text-muted-foreground",
    starting: "text-blue-400",
    scanning: "text-blue-400",
    detected: "text-green-400",
    matched: "text-green-400",
    "no-match": "text-amber-400",
  }[scanState];
  const stateIcon = {
    idle: null,
    starting: <Loader2 className="w-4 h-4 animate-spin" />,
    scanning: (
      <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
    ),
    detected: (
      <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
    ),
    matched: (
      <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
    ),
    "no-match": (
      <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
    ),
  }[scanState];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {!isLoaded && !apiError && (
        <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-400/10 rounded-lg px-3 py-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>{progress}</span>
        </div>
      )}
      {apiError && (
        <div className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
          {apiError}
        </div>
      )}
      <div
        className="relative rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: "4/3" }}
      >
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-32 h-40 rounded-[50%] border-2 border-dashed border-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Camera preview</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={cn("w-full h-full object-cover", !isActive && "opacity-0")}
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        {isActive && (
          <>
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br" />
          </>
        )}
        {scanState === "matched" && (
          <div className="absolute inset-x-0 bottom-0 bg-green-500/90 px-4 py-3 text-white text-sm font-semibold text-center">
            ACCESS GRANTED — {matchedName}
          </div>
        )}
      </div>
      {statusMsg && (
        <div className={cn("flex items-center gap-2 text-xs px-1", stateColor)}>
          {stateIcon}
          <span>{statusMsg}</span>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-2">
        {!isActive ? (
          <button
            type="button"
            data-ocid="facescanner.start.button"
            onClick={handleStart}
            disabled={!isLoaded || isLoading || scanState === "starting"}
            className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {scanState === "starting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Starting...
              </>
            ) : mode === "register" ? (
              "Start Face Capture"
            ) : (
              "Start Face Scan"
            )}
          </button>
        ) : (
          <button
            type="button"
            data-ocid="facescanner.stop.button"
            onClick={handleStop}
            className="flex-1 h-11 rounded-lg border border-border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
