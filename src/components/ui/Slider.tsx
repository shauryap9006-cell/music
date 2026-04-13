"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/frontend/lib/utils";

export function Slider({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("range-input", className)} type="range" {...props} />;
}

