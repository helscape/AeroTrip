import type { ComponentChildren } from "preact";
import { CircleAlert, CircleCheck } from "lucide-preact";

type AlertTone = "error" | "success" | "info";

const TONES: Record<AlertTone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

interface AlertProps {
  children: ComponentChildren;
  tone?: AlertTone;
  class?: string;
}

export function Alert({ children, tone = "info", class: className = "" }: AlertProps) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      class={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium ${TONES[tone]} ${className}`}
    >
      <Icon class="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
