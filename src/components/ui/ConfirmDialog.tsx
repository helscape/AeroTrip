import { AlertTriangle } from "lucide-preact";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div class="fixed inset-0 z-[110] grid place-items-center bg-navy-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        class="w-full max-w-md rounded-3xl bg-white p-6 shadow-[var(--shadow-float)]"
      >
        <span class="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle class="h-5 w-5" />
        </span>
        <h2 class="mt-4 text-xl font-extrabold text-navy-900">{title}</h2>
        <p class="mt-2 text-sm leading-relaxed text-navy-500">{message}</p>
        <div class="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Keep booking
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
