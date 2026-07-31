"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mic,
  Hand,
  MessagesSquare,
  Video,
  ShieldAlert,
  Bell,
  Sparkles,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const guides = [
  {
    icon: Mic,
    title: "Speech → Sign",
    href: "/app/speech",
    steps: [
      "Choose your spoken language.",
      "Click the microphone and speak clearly, or type a transcript.",
      "Stop recording, then Process with AI to play the animated sign sequence.",
    ],
  },
  {
    icon: Hand,
    title: "Sign → Text",
    href: "/app/sign",
    steps: [
      "Allow camera access, or upload a short MP4 / MOV / WEBM clip.",
      "Keep hands fully visible and well lit.",
      "Capture frames (or wait for upload detection), then Convert.",
    ],
  },
  {
    icon: MessagesSquare,
    title: "Live Conversation",
    href: "/app/conversation",
    steps: [
      "Open the split-screen conversation view.",
      "Send messages from either side to translate in context.",
      "Export the transcript when you are done.",
    ],
  },
  {
    icon: Video,
    title: "Video Translation",
    href: "/app/video",
    steps: [
      "Upload a short clip with clear hand signs.",
      "Wait while Enabler samples frames and classifies gestures.",
      "Review the transcript, confidence, and detected gestures.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "Emergency Cards",
    href: "/app/emergency",
    steps: [
      "Open Emergency for large high-contrast message cards.",
      "Tap a card to show it full-screen to someone nearby.",
      "These cards are designed for urgent, fast communication.",
    ],
  },
  {
    icon: Bell,
    title: "Sound Alerts",
    href: "/app/alerts",
    steps: [
      "Enable listening for environmental sound cues.",
      "Watch visual alerts when important sounds are detected.",
      "Use alongside Live Conversation or Emergency when needed.",
    ],
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    href: "/app/assistant",
    steps: [
      "Ask Enabler to simplify wording or suggest replies.",
      "Paste conversation context for better suggestions.",
      "Copy useful replies into Live Conversation.",
    ],
  },
];

const faqs = [
  {
    q: "Why is speech recognition unavailable?",
    a: "Web Speech works best in Chrome or Edge over HTTPS (or localhost). Allow microphone permission, then try again.",
  },
  {
    q: "Camera or video upload is stuck / no hands found",
    a: "Grant camera permission, use good lighting, keep both hands in frame, and prefer short clear clips. If upload stalls, refresh and try a smaller MP4 or WEBM file.",
  },
  {
    q: "I see a Gemini / API key or quota error",
    a: "AI features need GEMINI_API_KEY on the server (Vercel env vars for production). If the key works but requests fail with 429, wait and retry or switch GEMINI_MODEL to a current free-tier model such as gemini-3.1-flash-lite.",
  },
  {
    q: "Translations look wrong or incomplete",
    a: "Sign recognition is strongest for clear, common gestures. Capture multiple frames, speak slowly for Speech → Sign, and avoid cluttered backgrounds in video.",
  },
  {
    q: "Does History persist forever?",
    a: "History is stored for the current server instance and may reset after redeploys. Export important transcripts from each tool when you need a lasting copy.",
  },
  {
    q: "How do I change theme or language?",
    a: "Use the theme toggle in the header, and open Settings for language and accessibility preferences.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card/60">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {a}
        </p>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Badge className="mb-3">Help Center</Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          How to use Enabler
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Step-by-step guides for every tool, plus answers to common setup and
          accessibility questions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Open the Dashboard and pick a tool — start with Speech → Sign or Sign → Text.</p>
          <p>2. Allow microphone or camera permissions when your browser asks.</p>
          <p>3. Process your input, review the result, then save or export if needed.</p>
          <p>4. Use Emergency Cards anytime you need a large, clear message fast.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm">
              <Link href="/app">Go to Dashboard</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/app/settings">Open Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Feature guides</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {guides.map((guide) => (
            <Card key={guide.href} className="h-full">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <guide.icon className="h-5 w-5" />
                </div>
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  {guide.title}
                  <Link
                    href={guide.href}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
                  {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Accessibility tips</h2>
        <Card>
          <CardContent className="space-y-2 p-6 text-sm text-muted-foreground">
            <p>Use the skip link at the top of the page to jump straight to main content.</p>
            <p>All primary actions are keyboard reachable; look for visible focus rings.</p>
            <p>Switch light/dark theme anytime for contrast that works for you.</p>
            <p>Prefer Chrome or Edge when you need microphone-based speech recognition.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">FAQ</h2>
        <div className="space-y-2">
          {faqs.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>
    </div>
  );
}
