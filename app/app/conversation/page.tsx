"use client";

import { useState } from "react";
import { Loader2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES } from "@/lib/languages";

type Msg = { side: "left" | "right"; text: string; meta?: string };

export default function ConversationPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(side: "left" | "right", text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setMessages((m) => [...m, { side, text }]);
    if (side === "left") setLeft("");
    else setRight("");

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          role: side === "left" ? "speaker" : "signer",
          sourceLang: side === "left" ? sourceLang : targetLang,
          targetLang: side === "left" ? targetLang : sourceLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMessages((m) => [
        ...m,
        {
          side: side === "left" ? "right" : "left",
          text: data.translated,
          meta: `${Math.round((data.confidence || 0) * 100)}% · AI`,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversation failed");
    } finally {
      setLoading(false);
    }
  }

  const transcript = messages
    .map((m) => `${m.side === "left" ? "A" : "B"}: ${m.text}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Live Conversation</h1>
          <p className="mt-2 text-muted-foreground">
            Split-screen translation powered by OpenAI.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            aria-label="Source language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            aria-label="Target language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { side: "left" as const, title: "Speaker A", value: left, set: setLeft },
          { side: "right" as const, title: "Speaker B", value: right, set: setRight },
        ].map((panel) => (
          <Card key={panel.side} className="flex min-h-[420px] flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <CardTitle className="text-base">{panel.title}</CardTitle>
              <Badge variant="outline">{panel.side === "left" ? "Speech" : "Sign → Text"}</Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex-1 space-y-2 overflow-y-auto">
                {messages
                  .filter((m) => m.side === panel.side)
                  .map((m, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-primary/10 px-3 py-2 text-sm"
                    >
                      {m.text}
                      {m.meta && (
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {m.meta}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={panel.value}
                  onChange={(e) => panel.set(e.target.value)}
                  placeholder="Type a message…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void send(panel.side, panel.value);
                  }}
                />
                <Button
                  disabled={loading}
                  onClick={() => send(panel.side, panel.value)}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(transcript)}
          disabled={!transcript}
        >
          <Copy className="h-4 w-4" /> Copy
        </Button>
        <Button
          variant="secondary"
          disabled={!transcript}
          onClick={() => {
            const blob = new Blob([transcript], { type: "text/plain" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "enabler-conversation.txt";
            a.click();
          }}
        >
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button variant="ghost" onClick={() => setMessages([])}>
          Clear
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
