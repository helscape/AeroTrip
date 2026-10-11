import type { ComponentChildren } from "preact";

interface FieldVisualProps {
  /** Rendered Lucide icon element. */
  icon: ComponentChildren;
  label: string;
  value: string;
  hint?: string;
  class?: string;
}

/**
 * Static representation of a search form field.
 * Deliberately not an <input> — there is no form logic in this build.
 */
export function FieldVisual({
  icon,
  label,
  value,
  hint,
  class: className = "",
}: FieldVisualProps) {
  return (
    <div
      class={`group flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 transition-colors duration-200 hover:border-sky-300 hover:bg-sky-50/40 ${className}`}
    >
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-500 transition-colors duration-200 group-hover:bg-sky-100 group-hover:text-sky-600">
        {icon}
      </span>

      <span class="min-w-0 flex-1">
        <span class="block text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
          {label}
        </span>
        <span class="mt-0.5 block truncate text-sm font-semibold text-navy-900">
          {value}
        </span>
        {hint ? (
          <span class="mt-0.5 block truncate text-xs text-navy-400">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
