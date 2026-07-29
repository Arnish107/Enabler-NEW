"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  href = "/",
}: {
  className?: string;
  showWordmark?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 text-foreground", className)}
      aria-label="Enabler home"
    >
      <Image
        src="/assets/logo-icon.svg"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9"
        priority
      />
      {showWordmark && (
        <span className="text-sm font-bold tracking-[0.18em]">ENABLER</span>
      )}
    </Link>
  );
}
