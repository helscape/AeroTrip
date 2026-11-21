import { useState } from "preact/hooks";
import { Mail } from "lucide-preact";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useToast } from "@/context/ToastContext";
import { validEmail } from "@/lib/validation";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const { notify } = useToast();

  const subscribe = (event: Event) => {
    event.preventDefault();
    const problem = validEmail(email);
    setError(problem);
    if (problem) return;
    notify("You're on the list. Fares are on the way!", "success");
    setEmail("");
  };

  return (
    <section class="bg-white pb-20 sm:pb-24">
      <Container>
        <div class="rounded-[2rem] bg-navy-900 px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-400">
                Newsletter
              </p>
              <h2 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-4xl">
                Newsletter
              </h2>
              <p class="mt-4 max-w-lg text-sm leading-relaxed text-navy-200 sm:text-base">
                Get route and fare updates by email.
              </p>
            </div>

            <form onSubmit={subscribe} class="w-full">
              <div class="flex flex-col gap-3 sm:flex-row">
                <div class="flex h-12 flex-1 items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 focus-within:border-sky-400">
                  <Mail class="h-4 w-4 shrink-0 text-white/50" />
                  <input
                    type="email"
                    value={email}
                    aria-label="Email address"
                    placeholder="you@example.com"
                    onInput={(event) => setEmail((event.target as HTMLInputElement).value)}
                    class="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/40"
                  />
                </div>
                <Button type="submit" variant="secondary" size="lg" class="h-12 shrink-0">
                  Subscribe
                </Button>
              </div>
              {error ? (
                <Alert tone="error" class="mt-3">{error}</Alert>
              ) : (
                <p class="mt-4 text-xs text-navy-300">Unsubscribe any time. Demo only — no email is sent.</p>
              )}
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
