"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { FrameInput } from "@/lib/types";

declare global {
  interface Window {
    Hands?: new (config: { locateFile: (file: string) => string }) => {
      setOptions: (o: Record<string, unknown>) => void;
      onResults: (cb: (results: { multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>> }) => void) => void;
      send: (input: { image: HTMLCanvasElement | HTMLVideoElement }) => Promise<void>;
    };
  }
}

export default function SignPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [frames, setFrames] = useState<FrameInput[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gestures, setGestures] = useState<Array<{ label: string; confidence: number }>>([]);
  const handsReady = useRef(false);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  async function loadHands() {
    if (handsReady.current || window.Hands) {
      handsReady.current = true;
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load MediaPipe"));
      document.head.appendChild(script);
    });
    handsReady.current = true;
  }

  async function detectFromVideo(video: HTMLVideoElement): Promise<FrameInput | null> {
    await loadHands();
    if (!window.Hands) return null;
    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });
    return new Promise((resolve) => {
      hands.onResults((results) => {
        const lm = results.multiHandLandmarks?.[0];
        if (!lm) {
          resolve(null);
          return;
        }
        resolve({
          landmarks: lm.map((p) => ({ x: p.x, y: p.y, z: p.z })),
          timestamp: Date.now(),
        });
      });
      void hands.send({ image: video });
    });
  }

  async function openCamera() {
    setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      await loadHands();
      setStatus("Camera ready");
    } catch {
      setError("Camera permission denied or unavailable.");
    }
  }

  async function captureFrame() {
    if (!videoRef.current) return;
    setStatus("Capturing");
    const frame = await detectFromVideo(videoRef.current);
    if (!frame) {
      setError("No hands detected. Position hands clearly in frame.");
      setStatus("Ready");
      return;
    }
    setFrames((prev) => [...prev, frame]);
    setStatus(`${frames.length + 1} frame(s)`);
    setError("");
  }

  async function convert() {
    if (!frames.length && videoRef.current) {
      await captureFrame();
    }
    const payload = frames.length
      ? frames
      : videoRef.current
        ? [(await detectFromVideo(videoRef.current))].filter(Boolean)
        : [];

    if (!payload.length) {
      setError("Capture at least one frame with visible hands.");
      return;
    }

    setLoading(true);
    setStatus("Processing");
    try {
      const res = await fetch("/api/sign-to-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setText(data.text);
      setGestures(data.gestures || []);
      setStatus("Complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  async function onUpload(file: File) {
    setError("");
    setStatus("Loading video");
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    await video.play().catch(() => undefined);
    await new Promise<void>((r) => {
      video.onloadeddata = () => r();
    });
    const captured: FrameInput[] = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      video.currentTime = (video.duration || 2) * (i / count);
      await new Promise((r) => setTimeout(r, 120));
      const frame = await detectFromVideo(video);
      if (frame) captured.push(frame);
    }
    URL.revokeObjectURL(url);
    setFrames(captured);
    setStatus(`${captured.length} frames extracted`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Sign → Text</h1>
        <p className="mt-2 text-muted-foreground">
          Capture hand landmarks with MediaPipe, then classify and assemble sentences with AI.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Camera / Video</CardTitle>
            <Badge>{status}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  Camera preview
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={openCamera} variant="secondary">
                <Camera className="h-4 w-4" /> Open Camera
              </Button>
              <Button onClick={captureFrame} disabled={!stream}>
                Capture Frame
              </Button>
              <label className="inline-flex">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUpload(f);
                  }}
                />
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4" /> Upload
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Text Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={text} readOnly rows={8} placeholder="Converted text…" />
            <div className="flex flex-wrap gap-2">
              {gestures.map((g, i) => (
                <Badge key={i} variant="outline">
                  {g.label} ({Math.round(g.confidence * 100)}%)
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={convert} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Convert
              </Button>
              <Button
                variant="secondary"
                disabled={!text}
                onClick={() => {
                  const blob = new Blob([text], { type: "text/plain" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "enabler-sign-transcript.txt";
                  a.click();
                }}
              >
                Download
              </Button>
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
