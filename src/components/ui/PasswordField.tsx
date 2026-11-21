import { useState } from "preact/hooks";
import { Eye, EyeOff } from "lucide-preact";
import { TextField } from "./TextField";

interface PasswordFieldProps {
  label: string;
  value: string;
  onInput: (value: string) => void;
  error?: string;
  hint?: string;
  autocomplete?: string;
}

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div class="relative">
      <TextField {...props} type={visible ? "text" : "password"} class="pr-12" />
      <button
        type="button"
        class="absolute right-3 top-[calc(50%+6px)] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-navy-900"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff class="h-4 w-4" /> : <Eye class="h-4 w-4" />}
      </button>
    </div>
  );
}
