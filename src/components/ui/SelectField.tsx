interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  class?: string;
}

const SELECT_BASE =
  "w-full appearance-none rounded-2xl border border-navy-100 bg-white px-4 py-3 text-sm font-semibold text-navy-900 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

export function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
  error,
  class: className = "",
}: SelectFieldProps) {
  return (
    <label class={`block ${className}`}>
      <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
        {label}
      </span>
      <select
        value={value}
        aria-invalid={error ? "true" : undefined}
        onChange={(event) => onChange((event.target as HTMLSelectElement).value)}
        class={`${SELECT_BASE} ${error ? "border-red-300" : ""}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span class="mt-1 block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span class="mt-1 block text-xs text-navy-400">{hint}</span>
      ) : null}
    </label>
  );
}
