"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/frontend/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
}

export function Button({
  className,
  children,
  variant = "primary",
  icon,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        variant === "primary" &&
          "bg-white text-zinc-950 hover:bg-white/90",
        variant === "secondary" &&
          "border border-white/8 bg-white/[0.04] text-white hover:border-white/14 hover:bg-white/[0.08]",
        variant === "ghost" && "bg-transparent text-white/40 hover:text-white",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
