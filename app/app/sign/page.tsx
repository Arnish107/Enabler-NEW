"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { FrameInput } from "@/lib/types";
import {
  detectHandsInVideo,
  extractFramesFromVideoFile,
  getHands,
} from "@/lib/mediapipe-client";

export default function SignPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [frames, setFrames] = useState<FrameInput[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [gestures, setGestures] = useState<
    Array<{ label: string; confidence: number }>
  >([]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => undefined);
  }, [stream]);

  async function openCamera() {
    setError("");
    setStatus("Opening camera");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(s);
      setStatus("Loading hand tracker");
      await getHands();
      setStatus("Camera ready");
    } catch {
      setError("Camera permission denied or unavailable.");
      setStatus("Error");
    }
  }

  async function captureFrame() {
    if (!videoRef.current) return;
    setStatus("Capturing");
    setError("");
    try {
      const frame = await detectHandsInVideo(videoRef.current);
      if (!frame) {
        setError("No hands detected. Position hands clearly in frame.");
        setStatus("Ready");
        return;
      }
      setFrames((prev) => {
        const next = [...prev, frame];
        setStatus(`${next.length} frame(s)`);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Capture failed");
      setStatus("Error");
    }
  }

  async function convert() {
    let payload = frames;

    if (!payload.length && videoRef.current?.srcObject) {
      setStatus("Capturing");
      try {
        const frame = await detectHandsInVideo(videoRef.current);
        if (frame) {
          payload = [frame];
          setFrames(payload);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Capture failed");
        setStatus("Error");
        return;
      }
    }

    if (!payload.length) {
      setError("Capture at least one frame with visible hands, or upload a video.");
      return;
    }

    setLoading(true);
    setStatus("Processing");
    setError("");
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
    setExtracting(true);
    setStatus("Loading video");
    try {
      const captured = await extractFramesFromVideoFile(
        file,
        undefined,
        (label) => setStatus(label),
      );
      setFrames(captured);
      if (!captured.length) {
        setError(
          "No hands detected in the video. Try a clearer clip or use the live camera.",
        );
        setStatus("No hands found");
        return;
      }
      setStatus(`${captured.length} frames extracted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video processing failed");
      setStatus("Error");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Sign → Text</h1>
        <p className="mt-2 text-muted-foreground">
          Capture hand landmarks with MediaPipe, then classify and assemble
          sentences with AI.
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
              {extracting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 text-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>{status}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={openCamera}
                variant="secondary"
                disabled={extracting || loading}
              >
                <Camera className="h-4 w-4" /> Open Camera
              </Button>
              <Button
                onClick={captureFrame}
                disabled={!stream || extracting || loading}
              >
                Capture Frame
              </Button>
              <label className="inline-flex cursor-pointer">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
                  className="hidden"
                  disabled={extracting || loading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void onUpload(f);
                  }}
                />
                <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-transparent px-6 text-sm font-semibold text-foreground hover:bg-muted">
                  {extracting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload
                </span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {frames.length
                ? `${frames.length} landmark frame(s) ready for conversion.`
                : "Open the camera and capture frames, or upload a short sign video."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Text Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              readOnly
              rows={8}
              placeholder="Converted text…"
            />
            <div className="flex flex-wrap gap-2">
              {gestures.map((g, i) => (
                <Badge key={i} variant="outline">
                  {g.label} ({Math.round(g.confidence * 100)}%)
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={convert}
                disabled={loading || extracting}
              >
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
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
