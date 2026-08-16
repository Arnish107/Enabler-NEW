"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/lib/languages";
import { AnimatedSignOutput, type AnimatedSign } from "@/components/animated-sign-output";

export default function SpeechPage() {
  const [listening, setListening] = useState(false);
  const [live, setLive] = useState("");
  const [transcript, setTranscript] = useState("");
  const [signs, setSigns] = useState<AnimatedSign[]>([]);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setStatus("Processing");
    setError("");
    try {
      const res = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setTranscript(data.transcript);
      setSigns(data.signs || []);
      setStatus("Complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }, [language]);

  function startListening() {
    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    if (!SR) {
      setError("Web Speech API is not supported in this browser. Use Chrome or Edge.");
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "en" ? "en-US" : language;
    finalRef.current = "";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalRef.current += t + " ";
        else interim += t;
      }
      setLive((finalRef.current + interim).trim());
    };
    recognition.onerror = () => {
      setError("Speech recognition error");
      setListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setStatus("Listening");
    setError("");
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
    const text = live || finalRef.current;
    if (text) processTranscript(text);
    else setStatus("Ready");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Speech → Sign</h1>
        <p className="mt-2 text-muted-foreground">
          Speak into your microphone. Gemini cleans the transcript and plays a
          full animated signing video.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Input</CardTitle>
          <Badge
            variant={
              status === "Complete"
                ? "success"
                : status === "Error"
                  ? "warning"
                  : "default"
            }
          >
            {status}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex flex-col items-center gap-3 py-2 md:min-w-[140px]">
            <Button
              size="icon"
              className={`h-16 w-16 ${listening ? "animate-pulse bg-destructive" : ""}`}
              aria-label={listening ? "Stop recording" : "Start recording"}
              onClick={listening ? stopListening : startListening}
              disabled={loading}
            >
              {listening ? (
                <MicOff className="h-7 w-7" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {listening ? "Listening… stop when done" : "Tap to speak"}
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="lang">Language</Label>
              <select
                id="lang"
                className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              value={live || transcript}
              onChange={(e) => setLive(e.target.value)}
              placeholder="Live transcript appears here…"
              rows={3}
            />
            <Button
              onClick={() => processTranscript(live || transcript)}
              disabled={loading || !(live || transcript)}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Generate Sign Video
            </Button>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign Video</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatedSignOutput signs={signs} transcript={transcript} />
        </CardContent>
      </Card>
    </div>
  );
}
