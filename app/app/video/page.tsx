"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { extractFramesFromVideoFile } from "@/lib/mediapipe-client";

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
    setTranscript("");
    setStatus("Loading video");
    setProgress(8);

    try {
      // Adaptive sample count (undefined → duration-based in client)
      const frames = await extractFramesFromVideoFile(
        file,
        undefined,
        (label, ratio) => {
          setStatus(label);
          setProgress(Math.round(8 + ratio * 72));
        },
      );

      if (!frames.length) {
        throw new Error(
          "No hands detected in the video. Try a clearer, well-lit clip with hands visible throughout.",
        );
      }

      setStatus(`Translating ${frames.length} frames`);
      setProgress(85);
      const res = await fetch("/api/sign-to-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Translation failed");

      const gestures = Array.isArray(data.gestures) ? data.gestures : [];
      if (!gestures.length || !data.confidence) {
        setTranscript("");
        setProgress(100);
        setStatus("No signs found");
        setError(
          data.text ||
            "Hands were found but no recognizable signs matched. Try slower, clearer gestures.",
        );
        return;
      }

      const gestureLine = gestures
        .map(
          (g: { label?: string; word?: string; confidence?: number }) =>
            `${g.word || g.label} (${Math.round((g.confidence || 0) * 100)}%)`,
        )
        .join(" → ");

      const formatted = [
        `[Video] ${file.name}`,
        "",
        data.text,
        "",
        `Gestures: ${gestureLine}`,
        `Frames with hands: ${frames.length}`,
        `Confidence: ${Math.round((data.confidence || 0) * 100)}%`,
      ].join("\n");

      setTranscript(formatted);
      setProgress(100);
      setStatus("Complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      setStatus("Error");
      setTranscript("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Video Translation</h1>
        <p className="mt-2 text-muted-foreground">
          Upload MP4, MOV, or WEBM. Frames are sampled with MediaPipe Hands, then
          classified into text.
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
                disabled={loading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
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
              disabled={!transcript || loading}
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
