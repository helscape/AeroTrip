import { TextField } from "./TextField";

interface DateFieldProps {
  label: string;
  value: string;
  onInput: (value: string) => void;
  min?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  class?: string;
}

export function DateField(props: DateFieldProps) {
  return <TextField {...props} type="date" />;
}
