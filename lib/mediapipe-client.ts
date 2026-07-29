"use client";

import type { FrameInput } from "@/lib/types";

const HANDS_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240";

type LandmarkPoint = { x: number; y: number; z: number };

type HandsInstance = {
  setOptions: (o: Record<string, unknown>) => void;
  onResults: (
    cb: (results: { multiHandLandmarks?: LandmarkPoint[][] }) => void,
  ) => void;
  initialize?: () => Promise<void>;
  send: (input: { image: HTMLCanvasElement | HTMLVideoElement }) => Promise<void>;
  close?: () => void;
};

declare global {
  interface Window {
    Hands?: new (config: {
      locateFile: (file: string) => string;
    }) => HandsInstance;
  }
}

let scriptPromise: Promise<void> | null = null;
let handsSingleton: HandsInstance | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function loadHandsScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MediaPipe requires a browser"));
  }
  if (window.Hands) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-mediapipe-hands="true"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load MediaPipe Hands")),
        { once: true },
      );
      if (window.Hands) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `${HANDS_CDN}/hands.js`;
    script.async = true;
    script.dataset.mediapipeHands = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load MediaPipe Hands from CDN"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function getHands(): Promise<HandsInstance> {
  await loadHandsScript();
  if (!window.Hands) {
    throw new Error("MediaPipe Hands is unavailable in this browser");
  }
  if (handsSingleton) return handsSingleton;

  const hands = new window.Hands({
    locateFile: (file) => `${HANDS_CDN}/${file}`,
  });
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.55,
    minTrackingConfidence: 0.5,
  });
  if (typeof hands.initialize === "function") {
    await withTimeout(hands.initialize(), 20000, "MediaPipe initialize");
  }
  handsSingleton = hands;
  return hands;
}

export function waitForVideoReady(
  video: HTMLVideoElement,
  timeoutMs = 15000,
): Promise<void> {
  if (video.readyState >= 2) return Promise.resolve();

  return withTimeout(
    new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Could not load video file"));
      };
      const cleanup = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onError);
      };
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("canplay", onReady);
      video.addEventListener("error", onError);
      // In case readyState flips between the check and listeners
      if (video.readyState >= 2) onReady();
    }),
    timeoutMs,
    "Video load",
  );
}

export function seekVideo(
  video: HTMLVideoElement,
  time: number,
  timeoutMs = 8000,
): Promise<void> {
  const target = Math.max(
    0,
    Math.min(time, Number.isFinite(video.duration) ? Math.max(video.duration - 0.05, 0) : time),
  );

  if (Math.abs(video.currentTime - target) < 0.02 && video.readyState >= 2) {
    return Promise.resolve();
  }

  return withTimeout(
    new Promise<void>((resolve, reject) => {
      const onSeeked = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Video seek failed"));
      };
      const cleanup = () => {
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
      };
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("error", onError);
      try {
        video.currentTime = target;
      } catch (error) {
        cleanup();
        reject(error instanceof Error ? error : new Error("Video seek failed"));
      }
    }),
    timeoutMs,
    "Video seek",
  );
}

function drawVideoToCanvas(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");
  ctx.drawImage(video, 0, 0, width, height);
  return canvas;
}

export async function detectHandsInVideo(
  video: HTMLVideoElement,
  timeoutMs = 10000,
): Promise<FrameInput | null> {
  if (!video.videoWidth || !video.videoHeight) {
    return null;
  }

  const hands = await getHands();
  const canvas = drawVideoToCanvas(video);

  const landmarks = await withTimeout(
    new Promise<LandmarkPoint[] | null>((resolve, reject) => {
      let settled = false;
      hands.onResults((results) => {
        if (settled) return;
        settled = true;
        const lm = results.multiHandLandmarks?.[0];
        resolve(lm ?? null);
      });
      void hands.send({ image: canvas }).catch((error) => {
        if (settled) return;
        settled = true;
        reject(error);
      });
    }),
    timeoutMs,
    "Hand detection",
  );

  if (!landmarks) return null;
  return {
    landmarks: landmarks.map((p) => ({ x: p.x, y: p.y, z: p.z })),
    timestamp: Date.now(),
  };
}

function sampleTimes(duration: number, frameCount: number): number[] {
  const safeDuration = Math.max(duration, 0.2);
  // Skip leading/trailing edges where hands are often out of frame
  const margin = Math.min(0.12, safeDuration * 0.08);
  const start = margin;
  const end = Math.max(start + 0.05, safeDuration - margin);
  const span = end - start;
  const times: number[] = [];
  for (let i = 0; i < frameCount; i++) {
    const t = start + (span * (i + 0.5)) / frameCount;
    times.push(Math.min(t, Math.max(safeDuration - 0.04, 0)));
  }
  return times;
}

function adaptiveFrameCount(duration: number, requested?: number): number {
  if (requested && requested > 0) return Math.min(Math.max(requested, 4), 24);
  if (duration <= 2) return 8;
  if (duration <= 6) return 12;
  if (duration <= 15) return 16;
  return 20;
}

export async function extractFramesFromVideoFile(
  file: File,
  frameCount?: number,
  onProgress?: (label: string, ratio: number) => void,
): Promise<FrameInput[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.src = url;

  try {
    onProgress?.("Loading video", 0.05);
    await waitForVideoReady(video);
    // Warm decode; ignore autoplay policy failures
    await video.play().catch(() => undefined);
    video.pause();

    onProgress?.("Loading hand tracker", 0.12);
    await getHands();

    const duration =
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 2;
    const samples = adaptiveFrameCount(duration, frameCount);
    const times = sampleTimes(duration, samples);
    const captured: FrameInput[] = [];

    for (let i = 0; i < times.length; i++) {
      onProgress?.(
        `Detecting hands (${i + 1}/${times.length})`,
        0.15 + (0.8 * (i + 1)) / times.length,
      );
      await seekVideo(video, times[i]);
      // Let the decoder settle before capturing the canvas frame
      await new Promise((r) => window.setTimeout(r, 40));

      try {
        let frame = await detectHandsInVideo(video, 8000);
        if (!frame) {
          // One retry after a short pause — MediaPipe sometimes misses the first send
          await new Promise((r) => window.setTimeout(r, 60));
          frame = await detectHandsInVideo(video, 8000);
        }
        if (frame) {
          frame.timestamp = Math.round(times[i] * 1000);
          captured.push(frame);
        }
      } catch {
        // Skip frames that time out or fail detection
      }
    }

    onProgress?.("Done", 1);
    return captured;
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}
