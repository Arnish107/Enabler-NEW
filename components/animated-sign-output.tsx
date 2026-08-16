"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AnimatedSign = {
  word: string;
  label: string;
  gesture?: string;
};

type AnimatedSignOutputProps = {
  signs: AnimatedSign[];
  transcript?: string;
  className?: string;
};

const STEP_MS = 1800;

type ArmPose = {
  leftRotate: number;
  rightRotate: number;
  leftElbow: number;
  rightElbow: number;
  handScale: number;
  bounceY: number;
};

const poses: Record<string, ArmPose> = {
  hand_wave: {
    leftRotate: -20,
    rightRotate: -55,
    leftElbow: 10,
    rightElbow: -35,
    handScale: 1.08,
    bounceY: -6,
  },
  hand_raise: {
    leftRotate: -12,
    rightRotate: -110,
    leftElbow: 8,
    rightElbow: -20,
    handScale: 1.05,
    bounceY: -10,
  },
  thumbs_up: {
    leftRotate: -15,
    rightRotate: -70,
    leftElbow: 12,
    rightElbow: 15,
    handScale: 1.12,
    bounceY: -4,
  },
  thumbs_down: {
    leftRotate: -10,
    rightRotate: -40,
    leftElbow: 8,
    rightElbow: 35,
    handScale: 1.05,
    bounceY: 4,
  },
  open_palm: {
    leftRotate: -25,
    rightRotate: -95,
    leftElbow: 5,
    rightElbow: -10,
    handScale: 1.15,
    bounceY: -2,
  },
  fist: {
    leftRotate: -18,
    rightRotate: -50,
    leftElbow: 20,
    rightElbow: 25,
    handScale: 0.92,
    bounceY: 0,
  },
  point: {
    leftRotate: -12,
    rightRotate: -85,
    leftElbow: 8,
    rightElbow: -5,
    handScale: 1.1,
    bounceY: -3,
  },
  default: {
    leftRotate: -18,
    rightRotate: 18,
    leftElbow: 12,
    rightElbow: -12,
    handScale: 1,
    bounceY: 0,
  },
};

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SignAvatar({
  gesture,
  active,
  label,
}: {
  gesture?: string;
  active: boolean;
  label: string;
}) {
  const pose = poses[gesture || "default"] || poses.default;
  const wave = gesture === "hand_wave";

  return (
    <div className="relative flex h-full w-full items-end justify-center pb-6 sm:pb-10">
      {/* Soft studio floor glow */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[100%] bg-primary/20 blur-2xl sm:h-24" />

      <motion.div
        className="relative z-10"
        animate={
          active
            ? { y: [0, pose.bounceY, 0] }
            : { y: 0 }
        }
        transition={
          active
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        <svg
          viewBox="0 0 280 360"
          className="h-[280px] w-auto drop-shadow-xl sm:h-[360px] md:h-[420px]"
          role="img"
          aria-label={`Signing ${label}`}
        >
          <defs>
            <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(28 55% 78%)" />
              <stop offset="100%" stopColor="hsl(24 45% 62%)" />
            </linearGradient>
            <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(239 100% 68%)" />
              <stop offset="100%" stopColor="hsl(262 83% 58%)" />
            </linearGradient>
          </defs>

          {/* Legs / torso base */}
          <ellipse cx="140" cy="330" rx="54" ry="14" fill="hsl(230 20% 20% / 0.25)" />
          <rect x="108" y="210" width="64" height="110" rx="28" fill="url(#shirt)" />
          <circle cx="140" cy="118" r="42" fill="url(#skin)" />
          <ellipse cx="140" cy="168" rx="28" ry="18" fill="url(#shirt)" />

          {/* Face details */}
          <circle cx="126" cy="114" r="4.5" fill="hsl(230 40% 18%)" />
          <circle cx="154" cy="114" r="4.5" fill="hsl(230 40% 18%)" />
          <path
            d="M128 134 Q140 144 152 134"
            fill="none"
            stroke="hsl(230 40% 25%)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left arm */}
          <motion.g
            style={{ originX: "112px", originY: "178px" }}
            animate={{ rotate: active ? pose.leftRotate : -10 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <rect x="86" y="172" width="28" height="70" rx="14" fill="url(#shirt)" />
            <motion.g
              style={{ originX: "100px", originY: "240px" }}
              animate={{ rotate: active ? pose.leftElbow : 8 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
            >
              <rect x="88" y="232" width="24" height="58" rx="12" fill="url(#skin)" />
              <motion.circle
                cx="100"
                cy="298"
                r="16"
                fill="url(#skin)"
                animate={{ scale: active ? pose.handScale : 1 }}
              />
            </motion.g>
          </motion.g>

          {/* Right arm — primary signing arm */}
          <motion.g
            style={{ originX: "168px", originY: "178px" }}
            animate={
              active && wave
                ? { rotate: [pose.rightRotate - 18, pose.rightRotate + 18, pose.rightRotate - 18] }
                : { rotate: active ? pose.rightRotate : 12 }
            }
            transition={
              active && wave
                ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
                : { type: "spring", stiffness: 120, damping: 14 }
            }
          >
            <rect x="166" y="172" width="28" height="70" rx="14" fill="url(#shirt)" />
            <motion.g
              style={{ originX: "180px", originY: "240px" }}
              animate={{ rotate: active ? pose.rightElbow : -8 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
            >
              <rect x="168" y="232" width="24" height="58" rx="12" fill="url(#skin)" />
              <motion.g
                animate={
                  active && gesture === "point"
                    ? { x: [0, 10, 0] }
                    : active && gesture === "thumbs_up"
                      ? { y: [0, -8, 0] }
                      : {}
                }
                transition={{ duration: 0.85, repeat: active ? Infinity : 0, ease: "easeInOut" }}
              >
                <motion.circle
                  cx="180"
                  cy="298"
                  r="16"
                  fill="url(#skin)"
                  animate={{ scale: active ? pose.handScale : 1 }}
                />
                {/* Finger hint for point / thumbs */}
                {(gesture === "point" || gesture === "thumbs_up") && (
                  <motion.rect
                    x={gesture === "point" ? 186 : 172}
                    y={gesture === "point" ? 278 : 268}
                    width="8"
                    height={gesture === "point" ? 28 : 22}
                    rx="4"
                    fill="url(#skin)"
                    animate={
                      gesture === "thumbs_up"
                        ? { y: [268, 262, 268] }
                        : { x: [186, 192, 186] }
                    }
                    transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </motion.g>
            </motion.g>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}

function VideoStage({
  sign,
  active,
  index,
  total,
  expanded,
}: {
  sign: AnimatedSign;
  active: boolean;
  index: number;
  total: number;
  expanded: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-[#0b1020] text-white shadow-glow",
        expanded ? "aspect-[16/10] min-h-[420px] sm:min-h-[520px]" : "aspect-video min-h-[300px] sm:min-h-[380px]",
      )}
    >
      {/* Cinematic backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(75,77,255,0.35),transparent_55%),linear-gradient(180deg,#121833_0%,#0b1020_55%,#070b16_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Top chrome */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
        <span className="rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">
          Sign Video
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">
          Frame {index + 1}/{total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${sign.word}-${sign.label}-${index}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35 }}
        >
          <SignAvatar
            gesture={sign.gesture}
            active={active}
            label={sign.label}
          />
        </motion.div>
      </AnimatePresence>

      {/* Lower-third caption like a video subtitle */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-16">
        <motion.div
          key={sign.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-xl rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-center backdrop-blur-md"
        >
          <p className="text-lg font-bold tracking-wide sm:text-2xl">
            {sign.label}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
            {(sign.gesture || "sign").replaceAll("_", " ")}
          </p>
        </motion.div>
      </div>

      {/* Recording pip */}
      {active && (
        <div className="absolute left-4 top-14 z-20 flex items-center gap-2 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Live
        </div>
      )}
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
  const [expanded, setExpanded] = useState(true);

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

  const totalMs = useMemo(() => signs.length * STEP_MS, [signs.length]);
  const elapsedMs = useMemo(
    () => Math.min(totalMs, (index + (playing ? 0.5 : 1)) * STEP_MS),
    [index, playing, totalMs],
  );
  const progress = signs.length ? ((index + 1) / signs.length) * 100 : 0;

  if (signs.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-video min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground",
          className,
        )}
      >
        <p className="font-medium text-foreground">Sign video preview</p>
        <p>Process speech to generate an animated signing video.</p>
      </div>
    );
  }

  const current = signs[index] ?? signs[0];

  return (
    <div className={cn("space-y-4", className)}>
      <VideoStage
        sign={current}
        active={playing}
        index={index}
        total={signs.length}
        expanded={expanded}
      />

      {/* Video player controls */}
      <div className="rounded-2xl border border-border bg-card/80 p-3 sm:p-4">
        <button
          type="button"
          className="group relative mb-3 h-2 w-full overflow-hidden rounded-full bg-muted"
          aria-label="Seek sign timeline"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.min(
              1,
              Math.max(0, (e.clientX - rect.left) / rect.width),
            );
            const next = Math.min(
              signs.length - 1,
              Math.floor(ratio * signs.length),
            );
            setIndex(next);
            setPlaying(true);
          }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Previous sign"
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                setPlaying(true);
              }}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              aria-label={playing ? "Pause video" : "Play video"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Next sign"
              onClick={() => {
                setIndex((i) => Math.min(signs.length - 1, i + 1));
                setPlaying(true);
              }}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Replay video"
              onClick={replay}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs tabular-nums text-muted-foreground">
            {formatTime(elapsedMs)} / {formatTime(totalMs)}
          </p>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Compact player" : "Expand player"}
          >
            <Maximize2 className="h-4 w-4" />
            {expanded ? "Compact" : "Cinema"}
          </Button>
        </div>
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
              {s.label}
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
