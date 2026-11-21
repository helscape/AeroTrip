import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { Plane } from "lucide-preact";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { required, validEmail } from "@/lib/validation";

type Mode = "login" | "register";

export function LoginPage() {
  const location = useLocation();
  const { login, register } = useAuth();
  const { notify } = useToast();
  const [mode, setMode] = useState<Mode>(
    location.query.mode === "register" ? "register" : "login",
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const next = location.query.next || "/account";

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setErrors({});
    setFormError(null);
  };

  const submit = (event: Event) => {
    event.preventDefault();
    setFormError(null);
    const nextErrors: Record<string, string | undefined> = {
      email: validEmail(email),
      password: required(password, "Password"),
    };
    if (nextErrors.password && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (mode === "register") {
      nextErrors.fullName = required(fullName, "Full name");
      nextErrors.confirm =
        confirm === password ? undefined : "Passwords do not match.";
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setBusy(true);
    const request =
      mode === "login"
        ? login(email.trim().toLowerCase(), password)
        : register({
            email: email.trim().toLowerCase(),
            password,
            fullName: fullName.trim(),
            phone: phone.trim() || undefined,
          });

    request
      .then((user) => {
        notify(
          mode === "login" ? `Welcome back, ${user.fullName.split(" ")[0]}.` : "Account created. Welcome aboard!",
          "success",
        );
        location.route(next);
      })
      .catch((err: Error) => setFormError(err.message))
      .finally(() => setBusy(false));
  };

  return (
    <div class="min-h-[calc(100vh-5rem)] bg-navy-50/50">
      <Container class="py-10 sm:py-16">
        <div class="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-navy-100 bg-white shadow-[var(--shadow-float)] lg:grid-cols-2">
          <div class="hidden bg-navy-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
              <Plane class="h-5 w-5" />
            </span>
            <div>
              <h2 class="text-3xl font-extrabold leading-tight tracking-tight">
                AeroTrip account
              </h2>
              <p class="mt-4 max-w-sm text-sm leading-relaxed text-navy-200">
                Sign in to manage your profile and view bookings made with this account.
              </p>
            </div>
          </div>

          <div class="p-6 sm:p-10">
            <div class="flex rounded-full bg-navy-50 p-1" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                class={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
                  mode === "login" ? "bg-white text-navy-900 shadow-sm" : "text-navy-500"
                }`}
                onClick={() => switchMode("login")}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                class={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
                  mode === "register" ? "bg-white text-navy-900 shadow-sm" : "text-navy-500"
                }`}
                onClick={() => switchMode("register")}
              >
                Create account
              </button>
            </div>

            <h1 class="mt-8 text-2xl font-extrabold text-navy-900">
              {mode === "login" ? "Welcome back" : "Join AeroTrip"}
            </h1>
            <p class="mt-1.5 text-sm text-navy-500">
              {mode === "login"
                ? "Sign in to see your bookings and profile."
                : "It takes less than a minute. Guest checkout stays available."}
            </p>

            <form onSubmit={submit} class="mt-7 space-y-4">
              {mode === "register" ? (
                <TextField
                  label="Full name"
                  value={fullName}
                  onInput={setFullName}
                  placeholder="Ayu Lestari"
                  autocomplete="name"
                  error={errors.fullName}
                  required
                />
              ) : null}

              <TextField
                label="Email address"
                type="email"
                value={email}
                onInput={setEmail}
                placeholder="you@example.com"
                autocomplete="email"
                error={errors.email}
                required
              />

              {mode === "register" ? (
                <TextField
                  label="Phone number"
                  type="tel"
                  value={phone}
                  onInput={setPhone}
                  placeholder="Optional"
                  autocomplete="tel"
                />
              ) : null}

              <PasswordField
                label="Password"
                value={password}
                onInput={setPassword}
                autocomplete={mode === "login" ? "current-password" : "new-password"}
                error={errors.password}
                hint={mode === "register" ? "At least 8 characters" : undefined}
              />

              {mode === "register" ? (
                <PasswordField
                  label="Confirm password"
                  value={confirm}
                  onInput={setConfirm}
                  autocomplete="new-password"
                  error={errors.confirm}
                />
              ) : null}

              {formError ? <Alert tone="error">{formError}</Alert> : null}

              <Button type="submit" variant="secondary" size="lg" loading={busy} class="w-full">
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p class="mt-6 text-center text-xs text-navy-400">
              Just browsing?{" "}
              <Link href="/" class="font-semibold text-sky-600 hover:underline">
                Search flights as a guest
              </Link>
            </p>
            {mode === "login" ? (
              <p class="mt-3 rounded-xl bg-navy-50 px-3 py-2 text-center text-[11px] leading-relaxed text-navy-500">
                Seeded accounts: <strong>admin@aerotrip.test / admin</strong>
                <br />
                <strong>tourist@aerotrip.test / tourist</strong>
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  );
}
