import { TextField } from "@/components/ui/TextField";

interface ContactFieldsProps {
  email: string;
  phone: string;
  emailError?: string;
  onEmail: (value: string) => void;
  onPhone: (value: string) => void;
  hint?: string;
}

export function ContactFields({
  email,
  phone,
  emailError,
  onEmail,
  onPhone,
  hint,
}: ContactFieldsProps) {
  return (
    <div class="grid gap-3 sm:grid-cols-2">
      <TextField
        label="Contact email"
        type="email"
        value={email}
        onInput={onEmail}
        placeholder="you@example.com"
        autocomplete="email"
        hint={hint}
        error={emailError}
        required
      />
      <TextField
        label="Contact phone"
        type="tel"
        value={phone}
        onInput={onPhone}
        placeholder="+62 812 0000 0000"
        autocomplete="tel"
      />
    </div>
  );
}
