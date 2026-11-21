interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = "Loading..." }: SpinnerProps) {
  return (
    <div class="flex items-center justify-center gap-3 py-10 text-sm font-medium text-navy-500">
      <span class="h-5 w-5 animate-spin rounded-full border-2 border-navy-200 border-t-sky-500" />
      {label}
    </div>
  );
}
