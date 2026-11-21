import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { ArrowRight, Ticket } from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";

export function ManageStrip() {
  const { route } = useLocation();
  const { user } = useAuth();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState(
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("aerotrip.lastEmail") ?? ""
      : "",
  );

  const submit = (event: Event) => {
    event.preventDefault();
    const query = new URLSearchParams({
      reference: reference.trim().toUpperCase(),
      email: email.trim(),
    });
    route(`/manage?${query.toString()}`);
  };

  return (
    <section class="border-y border-navy-100 bg-navy-50/70 py-10 sm:py-12">
      <Container>
        <div class="grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,2fr)]">
          <div>
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-white text-sky-600 shadow-sm">
              <Ticket class="h-5 w-5" />
            </span>
            <h2 class="mt-3 text-xl font-extrabold text-navy-900">Already booked a trip?</h2>
            <p class="mt-1 text-sm text-navy-500">
              Find your itinerary, update contact details or cancel in seconds.
            </p>
            {!user ? (
              <Link href="/login" class="mt-2 inline-block text-xs font-semibold text-sky-600 hover:underline">
                Or sign in to see all your trips →
              </Link>
            ) : (
              <Link href="/account" class="mt-2 inline-block text-xs font-semibold text-sky-600 hover:underline">
                See your trips in My Account →
              </Link>
            )}
          </div>
          <form
            onSubmit={submit}
            class="grid gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <TextField
              label="Booking reference"
              value={reference}
              onInput={(v) => setReference(v.toUpperCase())}
              placeholder="AT-XXXXXX"
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onInput={setEmail}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" variant="secondary" size="lg" class="h-[3rem] sm:w-auto">
              Find trip <ArrowRight class="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
