"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type AnimatedSign = {
  word: string;
  emoji: string;
  label: string;
  gesture?: string;
};

type AnimatedSignOutputProps = {
  signs: AnimatedSign[];
  transcript?: string;
  className?: string;
};

const STEP_MS = 1400;

const gestureMotion: Record<
  string,
  {
    animate: Record<string, number | number[]>;
    transition: Record<string, unknown>;
  }
> = {
  hand_wave: {
    animate: { rotate: [-18, 18, -18, 18, 0], y: [0, -6, 0] },
    transition: { duration: 1.1, ease: "easeInOut" },
  },
  hand_raise: {
    animate: { y: [40, -8, 0], scale: [0.9, 1.08, 1] },
    transition: { duration: 0.9, ease: "easeOut" },
  },
  thumbs_up: {
    animate: { y: [16, -4, 0], rotate: [-8, 0], scale: [0.92, 1.1, 1] },
    transition: { duration: 0.8, ease: "easeOut" },
  },
  thumbs_down: {
    animate: { y: [-12, 8, 0], rotate: [8, 0], scale: [0.92, 1.05, 1] },
    transition: { duration: 0.8, ease: "easeOut" },
  },
  open_palm: {
    animate: { scale: [0.85, 1.12, 1], opacity: [0.5, 1] },
    transition: { duration: 0.75, ease: "easeOut" },
  },
  fist: {
    animate: { scale: [1.15, 0.95, 1], rotate: [0, -6, 0] },
    transition: { duration: 0.7, ease: "easeInOut" },
  },
  point: {
    animate: { x: [-24, 8, 0], rotate: [-12, 0] },
    transition: { duration: 0.85, ease: "easeOut" },
  },
  default: {
    animate: { scale: [0.88, 1.08, 1], rotate: [0, -4, 4, 0] },
    transition: { duration: 0.9, ease: "easeInOut" },
  },
};

function SignFigure({
  sign,
  active,
}: {
  sign: AnimatedSign;
  active: boolean;
}) {
  const key = sign.gesture && gestureMotion[sign.gesture] ? sign.gesture : "default";
  const motionCfg = gestureMotion[key];

  return (
    <div className="relative flex min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-primary/10 via-background to-primary/5">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        animate={
          active
            ? {
                background: [
                  "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.22), transparent 55%)",
                  "radial-gradient(circle at 45% 50%, hsl(var(--primary) / 0.12), transparent 60%)",
                  "radial-gradient(circle at 55% 35%, hsl(var(--primary) / 0.2), transparent 55%)",
                ],
              }
            : {}
        }
        transition={{ duration: 1.2, repeat: active ? Infinity : 0 }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${sign.word}-${sign.label}`}
          className="relative z-10 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 28, scale: 0.86 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <motion.div
            className="select-none text-7xl drop-shadow-sm sm:text-8xl"
            animate={active ? motionCfg.animate : { scale: 1, rotate: 0, x: 0, y: 0 }}
            transition={
              active
                ? { ...motionCfg.transition, repeat: Infinity, repeatDelay: 0.25 }
                : { duration: 0.2 }
            }
            style={{ originX: 0.5, originY: 1 }}
          >
            {sign.emoji || "🤟"}
          </motion.div>

          <motion.div
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold tracking-wide text-background"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {sign.label}
          </motion.div>

          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {sign.gesture?.replaceAll("_", " ") || "sign"}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function AnimatedSignOutput({
  signs,
  transcript,
  className,
}: AnimatedSignOutputProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    setIndex(0);
    setPlaying(true);
  }, [signs]);

  useEffect(() => {
    if (!playing || signs.length === 0) return;
    if (index >= signs.length - 1) {
      const endTimer = window.setTimeout(() => setPlaying(false), STEP_MS);
      return () => window.clearTimeout(endTimer);
    }
    const timer = window.setTimeout(() => {
      setIndex((i) => Math.min(i + 1, signs.length - 1));
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, signs.length]);

  const replay = useCallback(() => {
    setIndex(0);
    setPlaying(true);
  }, []);

  if (signs.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground",
          className,
        )}
      >
        Sign animation will play here
      </div>
    );
  }

  const current = signs[index] ?? signs[0];
  const progress = ((index + 1) / signs.length) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      <SignFigure sign={current} active={playing} />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Sign {index + 1} of {signs.length}
          </span>
          <span>{playing ? "Playing" : index >= signs.length - 1 ? "Finished" : "Paused"}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause animation" : "Play animation"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button size="sm" variant="ghost" onClick={replay} aria-label="Replay animation">
          <RotateCcw className="h-4 w-4" />
          Replay
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="list" aria-label="Sign sequence">
        {signs.map((s, i) => (
          <button
            key={`${s.word}-${i}`}
            type="button"
            role="listitem"
            onClick={() => {
              setIndex(i);
              setPlaying(true);
            }}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-current={i === index ? "true" : undefined}
          >
            <Badge
              variant={i === index ? "default" : "outline"}
              className={cn(
                "transition-transform",
                i === index && "scale-105 ring-2 ring-primary/30",
                i < index && "opacity-70",
              )}
            >
              {s.emoji} {s.label}
            </Badge>
          </button>
        ))}
      </div>

      {transcript ? (
        <p className="text-sm text-muted-foreground">{transcript}</p>
      ) : null}
    </div>
  );
}
