import { useEffect, useState } from "preact/hooks";
import { CalendarDays, Ticket, UserRound } from "lucide-preact";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { caption, formatDate, formatPrice } from "@/lib/format";
import { required } from "@/lib/validation";
import type { BookingSummary } from "@/types";

export function AccountPage() {
  const { user, updateProfile } = useAuth();
  const { notify } = useToast();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .myBookings()
      .then(setBookings)
      .catch((err: Error) => setListError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const save = (event: Event) => {
    event.preventDefault();
    const nextErrors = { fullName: required(fullName, "Full name") };
    setErrors(nextErrors);
    if (nextErrors.fullName) return;
    setSaving(true);
    updateProfile({ fullName: fullName.trim(), phone: phone.trim() || undefined })
      .then(() => notify("Profile updated.", "success"))
      .catch((err: Error) => notify(err.message, "error"))
      .finally(() => setSaving(false));
  };

  return (
    <Container class="py-10 sm:py-14">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">
        Your account
      </p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
        Hello, {user?.fullName.split(" ")[0]}
      </h1>
      <p class="mt-2 text-sm text-navy-500">
        Manage your details and keep track of every trip in one place.
      </p>

      <div class="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div class="space-y-6">
          <section class="rounded-3xl border border-navy-100 bg-white p-6 shadow-[var(--shadow-card)]">
            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-600">
              <UserRound class="h-5 w-5" />
            </span>
            <h2 class="mt-4 text-lg font-bold text-navy-900">Profile</h2>
            <p class="mt-1 text-xs text-navy-400">{user?.email}</p>
            {user?.role === "admin" ? (
              <span class="mt-2 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                Admin account
              </span>
            ) : null}
            <form onSubmit={save} class="mt-5 space-y-4">
              <TextField
                label="Full name"
                value={fullName}
                onInput={setFullName}
                error={errors.fullName}
                required
              />
              <TextField
                label="Phone number"
                type="tel"
                value={phone}
                onInput={setPhone}
                placeholder="Optional"
              />
              <Button type="submit" variant="outline" loading={saving} class="w-full">
                Save profile
              </Button>
            </form>
          </section>

          <section class="rounded-3xl border border-navy-100 bg-navy-900 p-6 text-white">
            <CalendarDays class="h-5 w-5 text-sky-400" />
            <h2 class="mt-4 text-lg font-bold">Ready for another trip?</h2>
            <p class="mt-1 text-sm text-navy-200">
              Search routes, compare fares and book in minutes.
            </p>
            <Button href="/" variant="light" size="sm" class="mt-5 w-full">
              Search flights
            </Button>
          </section>
        </div>

        <section class="rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-navy-900">Your bookings</h2>
            <Link href="/manage" class="text-xs font-semibold text-sky-600 hover:underline">
              Find a booking
            </Link>
          </div>

          {loading ? <Spinner label="Loading your trips..." /> : null}
          {listError ? (
            <Alert tone="error" class="mt-4">{listError}</Alert>
          ) : null}

          {!loading && !listError ? (
            bookings.length === 0 ? (
              <div class="mt-6 rounded-2xl border border-dashed border-navy-200 p-10 text-center">
                <Ticket class="mx-auto h-8 w-8 text-navy-300" />
                <p class="mt-3 text-sm font-semibold text-navy-700">No trips yet</p>
                <p class="mt-1 text-xs text-navy-400">
                  Bookings made while signed in will appear here.
                </p>
                <Button href="/" size="sm" class="mt-5">
                  Find a flight
                </Button>
              </div>
            ) : (
              <ul class="mt-5 space-y-3">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <Link
                      href={`/manage?reference=${encodeURIComponent(booking.reference)}&email=${encodeURIComponent(booking.contactEmail)}`}
                      class="flex flex-col gap-3 rounded-2xl border border-navy-100 p-4 transition-colors hover:border-sky-300 hover:bg-sky-50/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p class="text-sm font-bold tracking-wide text-navy-900">
                          {booking.reference}
                        </p>
                        <p class="text-xs text-navy-400">
                          {caption(booking.tripType)}, {formatDate(booking.createdAt)},{" "}
                          {booking.contactEmail}
                        </p>
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="text-sm font-bold text-navy-900">
                          {formatPrice(booking.total, booking.currency)}
                        </span>
                        <span
                          class={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            booking.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {caption(booking.status)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </section>
      </div>
    </Container>
  );
}
