"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const STORAGE_KEY = "enabler-splash-seen";

export function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) return;
    setShow(true);
    const timer = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setShow(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          role="status"
          aria-label="Loading Enabler"
        >
          <div className="gradient-mesh absolute inset-0" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center gap-5 text-center"
          >
            <Image
              src="/assets/logo-icon.svg"
              alt="Enabler"
              width={72}
              height={72}
              priority
              className="h-16 w-16 drop-shadow-glow"
            />
            <h1 className="text-3xl font-bold tracking-[0.2em] md:text-4xl">
              ENABLER
            </h1>
            <p className="max-w-sm text-sm text-muted-foreground md:text-base">
              Breaking Communication Barriers Through AI
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
