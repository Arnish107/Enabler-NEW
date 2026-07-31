"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Hand, Mic, MessagesSquare, ShieldAlert } from "lucide-react";

const DEFAULT_DEST = "/app";
const TOTAL_MS = 2800;

const steps = [
  { label: "Workspace", mobile: "Workspace", icon: Mic },
  { label: "Sign tools", mobile: "Sign tools", icon: Hand },
  { label: "Live chat", mobile: "Live chat", icon: MessagesSquare },
  { label: "Dashboard", mobile: "Dashboard", icon: ShieldAlert },
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
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16"
      role="status"
      aria-live="polite"
      aria-label="Entering Enabler dashboard"
    >
      <div className="gradient-mesh absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,hsl(var(--primary)/0.28),transparent_52%)]" />

      {/* Mobile phone-frame card */}
      <motion.div
        className="relative z-10 w-full max-w-md rounded-[2rem] border border-border/80 bg-card/80 p-5 shadow-glow backdrop-blur-xl sm:max-w-lg sm:rounded-[2.25rem] sm:p-8"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-muted sm:hidden" aria-hidden />

        <div className="flex flex-col items-center text-center">
          <motion.div
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-primary/30 bg-primary/15 shadow-glow sm:mb-8 sm:h-28 sm:w-28 sm:rounded-[2rem]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/assets/logo-icon.svg"
              alt="Enabler"
              width={72}
              height={72}
              priority
              className="h-12 w-12 sm:h-16 sm:w-16"
            />
          </motion.div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary sm:text-xs">
            Entering Enabler
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:mt-3 sm:text-4xl md:text-5xl">
            Opening your workspace
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
            <span className="sm:hidden">
              Setting up your mobile accessibility tools…
            </span>
            <span className="hidden sm:inline">
              You are moving from the landing page into the accessibility
              dashboard. Tools will be ready in a moment.
            </span>
          </p>

          <div className="mt-7 flex w-full flex-col items-center gap-3 sm:mt-10 sm:gap-4">
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm font-medium sm:w-auto sm:rounded-full sm:px-4 sm:py-2">
              <StepIcon className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{steps[stepIndex]?.label}</span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-muted sm:h-2.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-cyan"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>
            <p className="text-base font-bold tabular-nums text-foreground sm:text-sm sm:font-semibold">
              {progress}%
            </p>
          </div>

          {/* Mobile: horizontal step dots; desktop: cards */}
          <div className="mt-6 flex w-full items-center justify-center gap-2 sm:hidden" aria-hidden>
            {steps.map((step, i) => (
              <span
                key={step.label}
                className={`h-2 rounded-full transition-all ${
                  i === stepIndex
                    ? "w-8 bg-primary"
                    : i < stepIndex
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <ol className="mt-6 hidden w-full gap-2 text-left sm:mt-10 sm:grid sm:grid-cols-2">
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

          <p className="mt-5 text-xs text-muted-foreground sm:hidden">
            Optimized for phones and tablets
          </p>
        </div>
      </motion.div>
    </main>
  );
}

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Preparing Enabler…</p>
        </main>
      }
    >
      <EnterExperience />
    </Suspense>
  );
}
