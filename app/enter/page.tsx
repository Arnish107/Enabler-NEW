"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Hand, Mic, MessagesSquare, ShieldAlert } from "lucide-react";

const DEFAULT_DEST = "/app";
const TOTAL_MS = 2800;

const steps = [
  { label: "Loading workspace", icon: Mic },
  { label: "Preparing accessibility tools", icon: Hand },
  { label: "Connecting live translation", icon: MessagesSquare },
  { label: "Opening your dashboard", icon: ShieldAlert },
];

function safeDestination(raw: string | null): string {
  if (!raw) return DEFAULT_DEST;
  if (!raw.startsWith("/app")) return DEFAULT_DEST;
  if (raw.includes("//") || raw.includes("\\")) return DEFAULT_DEST;
  return raw;
}

function EnterExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = useMemo(
    () => safeDestination(searchParams.get("to")),
    [searchParams],
  );
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduceMotion ? 400 : TOTAL_MS;
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - started) / duration);
      setProgress(Math.round(ratio * 100));
      setStepIndex(
        Math.min(steps.length - 1, Math.floor(ratio * steps.length)),
      );
      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        router.replace(destination);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [destination, router]);

  const StepIcon = steps[stepIndex]?.icon ?? Mic;

  return (
    <main
      id="main"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16"
      role="status"
      aria-live="polite"
      aria-label="Entering Enabler dashboard"
    >
      <div className="gradient-mesh absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.22),transparent_55%)]" />

      <motion.div
        className="relative z-10 flex w-full max-w-lg flex-col items-center text-center"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-primary/30 bg-primary/15 shadow-glow"
          animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/assets/logo-icon.svg"
            alt="Enabler"
            width={72}
            height={72}
            priority
            className="h-16 w-16"
          />
        </motion.div>

        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Entering Enabler
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">
          Opening your workspace
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
          You are moving from the landing page into the accessibility dashboard.
          Tools will be ready in a moment.
        </p>

        <div className="mt-10 flex w-full flex-col items-center gap-4">
          <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium backdrop-blur">
            <StepIcon className="h-4 w-4 text-primary" />
            <span>{steps[stepIndex]?.label}</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {progress}%
          </p>
        </div>

        <ol className="mt-10 grid w-full gap-2 text-left sm:grid-cols-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <li
                key={step.label}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                  active
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : done
                      ? "border-border bg-muted/50 text-muted-foreground"
                      : "border-border/60 text-muted-foreground/70"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    active || done
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {step.label}
              </li>
            );
          })}
        </ol>
      </motion.div>
    </main>
  );
}

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Preparing Enabler…</p>
        </main>
      }
    >
      <EnterExperience />
    </Suspense>
  );
}
