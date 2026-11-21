import { useContext, useState } from "preact/hooks";
import { createContext } from "preact";
import type { ComponentChildren } from "preact";
import { Alert } from "@/components/ui/Alert";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  notify: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ComponentChildren }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = (message: string, tone: ToastTone = "info") => {
    const id = nextId++;
    setToasts((current) => [...current, { id, message, tone }]);
    globalThis.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4500);
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div class="pointer-events-none fixed right-4 top-20 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div class="pointer-events-auto shadow-[var(--shadow-float)]" key={toast.id}>
            <Alert
              tone={toast.tone}
              class="bg-white/95 backdrop-blur"
            >
              <span class="flex items-start justify-between gap-3">
                <span>{toast.message}</span>
                <button
                  type="button"
                  class="text-navy-400 hover:text-navy-900"
                  aria-label="Dismiss notification"
                  onClick={() =>
                    setToasts((current) => current.filter((t) => t.id !== toast.id))
                  }
                >
                  ×
                </button>
              </span>
            </Alert>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
