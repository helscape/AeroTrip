import { TextField } from "@/components/ui/TextField";
import { isoDatePlus } from "@/lib/format";
import type { PassengerInput } from "@/types";

interface PassengerFieldsProps {
  passengers: PassengerInput[];
  errors: Array<{ fullName?: string; dateOfBirth?: string }>;
  onChange: (index: number, field: keyof PassengerInput, value: string) => void;
}

export function PassengerFields({ passengers, errors, onChange }: PassengerFieldsProps) {
  return (
    <div class="space-y-4">
      {passengers.map((passenger, index) => (
        <div
          key={index}
          class="rounded-2xl border border-navy-100 bg-navy-50/40 p-4 sm:p-5"
        >
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
            Passenger {index + 1}
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Full name"
              value={passenger.fullName}
              onInput={(v) => onChange(index, "fullName", v)}
              placeholder="As shown on your ID"
              autocomplete="name"
              required
              error={errors[index]?.fullName}
            />
            <TextField
              label="Date of birth"
              type="date"
              value={passenger.dateOfBirth}
              onInput={(v) => onChange(index, "dateOfBirth", v)}
              max={isoDatePlus(0)}
              required
              error={errors[index]?.dateOfBirth}
            />
            <TextField
              label="Passport number"
              value={passenger.passportNumber ?? ""}
              onInput={(v) => onChange(index, "passportNumber", v)}
              placeholder="Optional"
              class="sm:col-span-2"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
