import { CreditCard, LockKeyhole } from "lucide-preact";
import { TextField } from "@/components/ui/TextField";
import type { PaymentDetails } from "@/types";

interface PaymentFieldsProps {
  values: PaymentDetails;
  errors: Partial<Record<keyof PaymentDetails, string>>;
  onChange: (field: keyof PaymentDetails, value: string) => void;
}

export function PaymentFields({ values, errors, onChange }: PaymentFieldsProps) {
  const digits = (value: string) => value.replace(/\D/g, "");

  return (
    <div>
      <div class="flex items-start justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <div class="flex gap-3">
          <CreditCard class="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div>
            <p class="text-sm font-bold text-navy-900">Demo payment step</p>
            <p class="mt-1 text-xs leading-relaxed text-navy-500">
              This is how a real checkout would look. Card details are validated
              in your browser only — nothing is sent, stored or charged.
            </p>
          </div>
        </div>
        <LockKeyhole class="h-4 w-4 shrink-0 text-emerald-500" />
      </div>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Name on card"
          value={values.cardName}
          onInput={(v) => onChange("cardName", v)}
          placeholder="Ayu Lestari"
          autocomplete="cc-name"
          error={errors.cardName}
          class="sm:col-span-2"
          required
        />
        <TextField
          label="Card number"
          value={values.cardNumber}
          onInput={(v) =>
            onChange(
              "cardNumber",
              digits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 "),
            )
          }
          placeholder="4242 4242 4242 4242"
          autocomplete="cc-number"
          inputmode="numeric"
          error={errors.cardNumber}
          class="sm:col-span-2"
          required
        />
        <TextField
          label="Expiry date"
          value={values.expiry}
          onInput={(v) => {
            const clean = digits(v).slice(0, 4);
            onChange("expiry", clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean);
          }}
          placeholder="MM/YY"
          autocomplete="cc-exp"
          error={errors.expiry}
          required
        />
        <TextField
          label="Security code"
          value={values.cvv}
          onInput={(v) => onChange("cvv", digits(v).slice(0, 4))}
          placeholder="123"
          autocomplete="cc-csc"
          error={errors.cvv}
          required
        />
      </div>
    </div>
  );
}
