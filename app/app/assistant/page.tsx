"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [task, setTask] = useState<"assist" | "simplify" | "enhance" | "suggest">(
    "assist",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, task }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">AI Assistant</h1>
        <p className="mt-2 text-muted-foreground">
          Simplify language, enhance transcripts, and get conversation suggestions.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Enabler AI
          </CardTitle>
          <Badge>Gemini</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["assist", "Assist"],
                ["simplify", "Simplify"],
                ["enhance", "Enhance"],
                ["suggest", "Suggest replies"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={task === value ? "default" : "secondary"}
                onClick={() => setTask(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder="Ask for help or paste text to improve…"
          />
          <Button onClick={run} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Run
          </Button>
          {result && (
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
