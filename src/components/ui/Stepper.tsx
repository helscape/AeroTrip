import { Minus, Plus } from "lucide-preact";

interface StepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  hint?: string;
  class?: string;
}

export function Stepper({
  label,
  value,
  min = 1,
  max = 9,
  onChange,
  hint,
  class: className = "",
}: StepperProps) {
  return (
    <div class={className}>
      <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
        {label}
      </span>
      <div class="flex items-center justify-between rounded-2xl border border-navy-100 bg-white px-3 py-2">
        <div>
          <span class="block text-sm font-semibold text-navy-900">
            {value} {value === 1 ? "passenger" : "passengers"}
          </span>
          {hint ? <span class="block text-xs text-navy-400">{hint}</span> : null}
        </div>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full border border-navy-100 text-navy-600 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease passenger count"
            disabled={value <= min}
            onClick={() => onChange(Math.max(min, value - 1))}
          >
            <Minus class="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full border border-navy-100 text-navy-600 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase passenger count"
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + 1))}
          >
            <Plus class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
