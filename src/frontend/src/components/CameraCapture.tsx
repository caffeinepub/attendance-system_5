import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, RefreshCw, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onClear?: () => void;
  capturedPreview?: string | null;
  className?: string;
  large?: boolean;
}

export default function CameraCapture({
  onCapture,
  onClear,
  capturedPreview,
  className,
  large = false,
}: CameraCaptureProps) {
  const {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  } = useCamera({ facingMode: "user" });
  const [localPreview, setLocalPreview] = useState<string | null>(
    capturedPreview || null,
  );

  useEffect(() => {
    setLocalPreview(capturedPreview || null);
  }, [capturedPreview]);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    onCapture(file, url);
    stopCamera();
  };

  const handleRetake = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onClear?.();
    startCamera();
  };

  const videoH = large ? "h-72 md:h-96" : "h-52";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <canvas ref={canvasRef} className="hidden" />

      {localPreview ? (
        <div className="relative rounded-xl overflow-hidden border border-border">
          <img
            src={localPreview}
            alt="Captured"
            className={cn("w-full object-cover", videoH)}
          />
          <div className="absolute inset-0 bg-foreground/10" />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-3 right-3"
            onClick={handleRetake}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Retake
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "relative rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center",
            videoH,
          )}
        >
          {isActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <VideoOff className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{error ? error.message : "Camera off"}</p>
            </div>
          )}
        </div>
      )}

      {!localPreview && (
        <div className="flex gap-2">
          {!isActive ? (
            <Button
              type="button"
              variant="outline"
              className={cn("flex-1", large && "h-12 text-base")}
              onClick={startCamera}
              disabled={isLoading}
            >
              <Video className="w-4 h-4 mr-2" />
              {isLoading ? "Starting..." : "Start Camera"}
            </Button>
          ) : (
            <Button
              type="button"
              data-ocid="checkin.capture_button"
              className={cn("flex-1", large && "h-12 text-base")}
              onClick={handleCapture}
            >
              <Camera className="w-4 h-4 mr-2" /> Capture Photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
