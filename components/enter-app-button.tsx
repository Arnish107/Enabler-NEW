"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EnterAppButtonProps = Omit<ButtonProps, "onClick"> & {
  href?: string;
  children: React.ReactNode;
  onBeforeNavigate?: () => void;
};

export function EnterAppButton({
  href = "/app",
  children,
  className,
  disabled,
  onBeforeNavigate,
  ...props
}: EnterAppButtonProps) {
  const router = useRouter();
  const [overlay, setOverlay] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!overlay) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timer = window.setTimeout(
      () => {
        startTransition(() => {
          router.push(href);
        });
      },
      reduce ? 120 : 720,
    );
    return () => window.clearTimeout(timer);
  }, [overlay, href, router]);

  return (
    <>
      <Button
        {...props}
        className={cn(className)}
        disabled={disabled || overlay || pending}
        onClick={() => {
          onBeforeNavigate?.();
          setOverlay(true);
        }}
      >
        {children}
      </Button>

      <AnimatePresence>
        {overlay && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            role="status"
            aria-live="polite"
            aria-label="Opening dashboard"
          >
            <div className="gradient-mesh absolute inset-0 opacity-80" />
            <motion.div
              className="relative z-10 flex flex-col items-center gap-4 text-center"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/assets/logo-icon.svg"
                  alt=""
                  width={64}
                  height={64}
                  className="h-14 w-14 drop-shadow-glow"
                  priority
                />
              </motion.div>
              <p className="text-sm font-semibold tracking-[0.22em] text-foreground">
                ENTERING ENABLER
              </p>
              <p className="text-xs text-muted-foreground">
                Preparing your accessibility workspace…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
