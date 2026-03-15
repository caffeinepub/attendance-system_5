import { useEffect, useRef, useState } from "react";

// Primary CDN for face-api.js weights - official GitHub Pages
const MODEL_URLS = [
  "https://justadudewhohacks.github.io/face-api.js/models",
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights",
];

let globalLoadPromise: Promise<void> | null = null;
let globalLoaded = false;

async function loadModelsFromUrl(faceapi: any, url: string): Promise<void> {
  await faceapi.nets.tinyFaceDetector.loadFromUri(url);
  await faceapi.nets.faceLandmark68Net.loadFromUri(url);
  await faceapi.nets.faceRecognitionNet.loadFromUri(url);
}

function loadFaceApi(): Promise<void> {
  if (globalLoaded) return Promise.resolve();
  if (globalLoadPromise) return globalLoadPromise;

  globalLoadPromise = new Promise((resolve, reject) => {
    const tryLoad = async (faceapi: any) => {
      for (const url of MODEL_URLS) {
        try {
          await loadModelsFromUrl(faceapi, url);
          globalLoaded = true;
          resolve();
          return;
        } catch (e) {
          console.warn(`Model load failed from ${url}:`, e);
        }
      }
      reject(
        new Error("Failed to load face recognition models from all sources"),
      );
    };

    const existing = (window as any).faceapi;
    if (existing) {
      tryLoad(existing);
      return;
    }

    const script = document.createElement("script");
    script.id = "face-api-script";
    script.src =
      "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.crossOrigin = "anonymous";
    script.onload = () => tryLoad((window as any).faceapi);
    script.onerror = () =>
      reject(new Error("Failed to load face-api.js library"));
    document.head.appendChild(script);
  });

  return globalLoadPromise;
}

export function useFaceApi() {
  const [isLoaded, setIsLoaded] = useState(globalLoaded);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(
    globalLoaded ? "Ready" : "Loading models...",
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (globalLoaded) {
      setIsLoaded(true);
      setProgress("Ready");
      return;
    }

    setProgress("Loading face recognition models...");
    loadFaceApi()
      .then(() => {
        if (mountedRef.current) {
          setIsLoaded(true);
          setProgress("Ready");
        }
      })
      .catch((e) => {
        if (mountedRef.current) setError(e.message);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { isLoaded, error, progress };
}

export function euclideanDistance(d1: number[], d2: number[]): number {
  return Math.sqrt(d1.reduce((sum, v, i) => sum + (v - d2[i]) ** 2, 0));
}

/** Average multiple face descriptors for more reliable matching */
export function averageDescriptors(descriptors: number[][]): number[] {
  if (!descriptors.length) return [];
  const len = descriptors[0].length;
  const avg = new Array(len).fill(0);
  for (const d of descriptors) {
    for (let i = 0; i < len; i++) avg[i] += d[i];
  }
  return avg.map((v) => v / descriptors.length);
}

/** Detect a face in a video element and return its descriptor */
export async function detectFaceDescriptor(
  videoEl: HTMLVideoElement,
): Promise<number[] | null> {
  const faceapi = (window as any).faceapi;
  if (!faceapi) return null;
  try {
    const result = await faceapi
      .detectSingleFace(
        videoEl,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.4,
        }),
      )
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!result) return null;
    return Array.from(result.descriptor as Float32Array);
  } catch {
    return null;
  }
}

/** Get detection with bounding box */
export async function detectFaceWithBox(videoEl: HTMLVideoElement) {
  const faceapi = (window as any).faceapi;
  if (!faceapi) return null;
  try {
    const result = await faceapi
      .detectSingleFace(
        videoEl,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.4,
        }),
      )
      .withFaceLandmarks()
      .withFaceDescriptor();
    return result ?? null;
  } catch {
    return null;
  }
}
