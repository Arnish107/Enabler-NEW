"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function VideoPage() {
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Waiting");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function processFile(file: File) {
    setFileName(file.name);
    setLoading(true);
    setError("");
    setStatus("Uploading");
    setProgress(15);

    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.muted = true;
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("Could not load video"));
      });
      setProgress(40);
      setStatus("Extracting frames");

      // Load MediaPipe and sample frames
      if (!window.Hands) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src =
            "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("MediaPipe failed to load"));
          document.head.appendChild(s);
        });
      }

      const hands = new window.Hands!({
        locateFile: (f) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}`,
      });
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.5,
      });

      const frames: Array<{ landmarks: Array<{ x: number; y: number; z: number }> }> = [];
      const samples = 8;
      for (let i = 0; i < samples; i++) {
        video.currentTime = ((video.duration || 2) * i) / samples;
        await new Promise((r) => setTimeout(r, 100));
        const landmarks = await new Promise<Array<{ x: number; y: number; z: number }> | null>(
          (resolve) => {
            hands.onResults((results) => {
              const lm = results.multiHandLandmarks?.[0];
              resolve(lm ? lm.map((p) => ({ x: p.x, y: p.y, z: p.z })) : null);
            });
            void hands.send({ image: video });
          },
        );
        if (landmarks) frames.push({ landmarks });
        setProgress(40 + Math.round(((i + 1) / samples) * 35));
      }
      URL.revokeObjectURL(url);

      setStatus("Translating");
      setProgress(85);
      const res = await fetch("/api/sign-to-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      const formatted = `[Video] ${file.name}\n\n${data.text}\n\nConfidence: ${Math.round((data.confidence || 0) * 100)}%`;
      setTranscript(formatted);
      setProgress(100);
      setStatus("Complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Video Translation</h1>
        <p className="mt-2 text-muted-foreground">
          Upload MP4, MOV, or WEBM. Hand landmarks are extracted and processed by the backend.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 py-16 text-center transition hover:border-primary/40">
              <Upload className="mb-3 h-8 w-8 text-primary" />
              <span className="font-medium">Drop video or click to upload</span>
              <span className="mt-1 text-sm text-muted-foreground">
                MP4 · MOV · WEBM
              </span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void processFile(f);
                }}
              />
            </label>
            {fileName && (
              <p className="text-sm text-muted-foreground">{fileName}</p>
            )}
            {(loading || progress > 0) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transcript</CardTitle>
            <Badge variant={status === "Complete" ? "success" : "default"}>
              {status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={transcript}
              readOnly
              rows={12}
              placeholder="Transcript output…"
            />
            <Button
              variant="secondary"
              disabled={!transcript}
              onClick={() => {
                const blob = new Blob([transcript], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "enabler-video-transcript.txt";
                a.click();
              }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Download
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
