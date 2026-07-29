import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "warning" | "outline";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      variant === "default" && "bg-primary/15 text-primary",
      variant === "success" && "bg-emerald/15 text-emerald",
      variant === "warning" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      variant === "outline" && "border border-border text-muted-foreground",
      className,
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
