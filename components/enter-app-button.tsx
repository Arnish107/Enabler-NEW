"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EnterAppButtonProps = Omit<ButtonProps, "asChild"> & {
  /** Final destination after the enter transition page */
  href?: string;
  children: React.ReactNode;
  onBeforeNavigate?: () => void;
};

function enterPath(destination = "/app") {
  const to = destination.startsWith("/app") ? destination : "/app";
  return `/enter?to=${encodeURIComponent(to)}`;
}

export function EnterAppButton({
  href = "/app",
  children,
  className,
  onBeforeNavigate,
  ...props
}: EnterAppButtonProps) {
  return (
    <Button asChild className={cn(className)} {...props}>
      <Link
        href={enterPath(href)}
        onClick={() => {
          onBeforeNavigate?.();
        }}
      >
        {children}
      </Link>
    </Button>
  );
}
