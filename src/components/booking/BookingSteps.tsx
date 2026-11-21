import { Check } from "lucide-preact";

const LABELS = ["Flight", "Travelers", "Review & pay", "Confirmation"];

export function BookingSteps({ current }: { current: number }) {
  return (
    <ol class="flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3">
      {LABELS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} class="flex items-center gap-2 sm:gap-3">
            <div class="flex items-center gap-2">
              <span
                class={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-navy-900 text-white"
                      : "bg-navy-100 text-navy-400"
                }`}
              >
                {done ? <Check class="h-4 w-4" /> : index + 1}
              </span>
              <span
                class={`whitespace-nowrap text-xs font-semibold sm:text-sm ${
                  active || done ? "text-navy-900" : "text-navy-400"
                }`}
              >
                {label}
              </span>
            </div>
            {index < LABELS.length - 1 ? (
              <span class={`h-px w-4 sm:w-10 ${done ? "bg-emerald-400" : "bg-navy-200"}`} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
