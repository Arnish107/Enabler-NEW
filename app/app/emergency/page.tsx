"use client";

import { useState } from "react";
import {
  HeartPulse,
  EarOff,
  Keyboard,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const cards: Array<{
  id: string;
  icon: LucideIcon;
  title: string;
  sub: string;
}> = [
  {
    id: "deaf",
    icon: EarOff,
    title: "I am deaf.",
    sub: "Please face me and speak clearly, or write your message.",
  },
  {
    id: "type",
    icon: Keyboard,
    title: "Please type your response.",
    sub: "I communicate best through written text.",
  },
  {
    id: "medical",
    icon: HeartPulse,
    title: "I need medical assistance.",
    sub: "Please call emergency services immediately.",
  },
  {
    id: "call",
    icon: PhoneCall,
    title: "Call emergency services.",
    sub: "This is an emergency. Dial your local emergency number.",
  },
];

export default function EmergencyPage() {
  const [active, setActive] = useState<(typeof cards)[0] | null>(null);

  function showFullscreen() {
    if (!active) return;
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:9999;background:hsl(239 100% 55%);color:white;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;cursor:pointer";
    overlay.innerHTML = `<div><h1 style="font-size:clamp(2rem,8vw,4rem);margin:0 0 1rem;font-weight:800">${active.title}</h1><p style="font-size:1.25rem;opacity:.9">${active.sub}</p><p style="margin-top:2rem;opacity:.7;font-size:.875rem">Tap to close</p></div>`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">
          Emergency Communication
        </h1>
        <p className="mt-2 text-muted-foreground">
          Large accessibility cards for high-stress situations.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                setActive(card);
                if (navigator.vibrate) navigator.vibrate(200);
              }}
              className={`rounded-3xl border-2 p-8 text-left transition hover:-translate-y-1 hover:border-primary hover:shadow-glow ${
                active?.id === card.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                aria-hidden
              >
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-bold">{card.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{card.sub}</p>
            </button>
          );
        })}
      </div>
      {active && (
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Active message
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">{active.title}</h2>
            <p className="text-muted-foreground">{active.sub}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={showFullscreen}>Show Fullscreen</Button>
              <Button
                variant="secondary"
                onClick={() =>
                  navigator.clipboard.writeText(`${active.title} ${active.sub}`)
                }
              >
                Copy
              </Button>
              <Button variant="ghost" onClick={() => setActive(null)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
