import type { ReactNode } from "react";

import { cn } from "@/frontend/lib/utils";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/6 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/35",
        className
      )}
    >
      {children}
    </span>
  );
}

