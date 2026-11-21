import { useRef } from "preact/hooks";

interface TextFieldProps {
  label: string;
  value: string;
  onInput: (value: string) => void;
  name?: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "password";
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
  autocomplete?: string;
  inputmode?: string;
  class?: string;
}

const INPUT_BASE =
  "w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-navy-900 outline-none transition-colors placeholder:font-normal placeholder:text-navy-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

export function TextField({
  label,
  value,
  onInput,
  name,
  type = "text",
  placeholder,
  hint,
  error,
  required,
  min,
  max,
  autocomplete,
  inputmode,
  class: className = "",
}: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (type !== "date") return;
    const input = inputRef.current;
    if (!input) return;
    try {
      input.showPicker?.();
    } catch {
      input.focus();
    }
  };

  return (
    <label class={`block ${className}`}>
      <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        ref={inputRef}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        autocomplete={autocomplete}
        inputMode={inputmode}
        aria-invalid={error ? "true" : undefined}
        onClick={openPicker}
        onInput={(event) => onInput((event.target as HTMLInputElement).value)}
        class={`${INPUT_BASE} ${error ? "border-red-300" : "border-navy-100"}`}
      />
      {error ? (
        <span class="mt-1 block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span class="mt-1 block text-xs text-navy-400">{hint}</span>
      ) : null}
    </label>
  );
}
