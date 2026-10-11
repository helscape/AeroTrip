import type { ComponentChildren } from "preact";

export type BadgeTone = "sky" | "navy" | "emerald" | "amber" | "white";

const TONES: Record<BadgeTone, string> = {
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  navy: "bg-navy-50 text-navy-700 ring-navy-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  white: "bg-white/90 text-navy-800 ring-white/70 backdrop-blur-sm",
};

interface BadgeProps {
  children: ComponentChildren;
  tone?: BadgeTone;
  class?: string;
}

export function Badge({ children, tone = "navy", class: className = "" }: BadgeProps) {
  return (
    <span
      class={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
