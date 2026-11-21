import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { CircleCheck, Search, Ticket } from "lucide-preact";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ContactFields } from "@/components/booking/ContactFields";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Container } from "@/components/ui/Container";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { caption, formatDate, formatPrice, formatTime } from "@/lib/format";
import type { Booking, BookingSummary } from "@/types";

export function ManageBookingPage() {
  const location = useLocation();
  const { user } = useAuth();
  const { notify } = useToast();
  const [reference, setReference] = useState(location.query.reference ?? "");
  const [email, setEmail] = useState(
    location.query.email ||
      (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("aerotrip.lastEmail") ?? "" : ""),
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [summaries, setSummaries] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactError, setContactError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (location.query.reference && location.query.email) {
      lookup(location.query.reference, location.query.email);
    } else if (user) {
      api
        .myBookings()
        .then(setSummaries)
        .catch(() => {
          /* summaries are a convenience */
        });
    }
  }, []);

  const lookup = (ref: string, mail: string) => {
    if (!ref.trim() || !mail.trim()) {
      setError("Enter both a booking reference and email.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    setBooking(null);
    Promise.all([api.getBooking(ref, mail), api.listBookings(mail)])
      .then(([found, list]) => {
        setBooking(found);
        setSummaries(list);
        setContactEmail(found.contactEmail);
        setContactPhone(found.contactPhone ?? "");
        sessionStorage.setItem("aerotrip.lastEmail", mail.trim().toLowerCase());
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const saveContact = (event: Event) => {
    event.preventDefault();
    if (!booking) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setContactError("Enter a valid email address.");
      return;
    }
    setContactError(undefined);
    setSaving(true);
    setMessage(null);
    api
      .updateBooking(booking.id, booking.reference, email, {
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone.trim() || undefined,
      })
      .then((updated) => {
        setBooking(updated);
        setEmail(updated.contactEmail);
        setContactEmail(updated.contactEmail);
        setMessage("Contact details updated.");
        notify("Booking contact details updated.", "success");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSaving(false));
  };

  const cancel = () => {
    if (!booking) return;
    setCancelling(true);
    setError(null);
    api
      .cancelBooking(booking.id, booking.reference, email)
      .then(() => {
        setConfirmOpen(false);
        setMessage("Booking cancelled and seats restored.");
        notify("Booking cancelled. Seats are back in inventory.", "success");
        return api.getBooking(booking.reference, email);
      })
      .then((updated) => setBooking(updated))
      .catch((err: Error) => setError(err.message))
      .finally(() => setCancelling(false));
  };

  return (
    <Container class="max-w-5xl py-10 sm:py-14">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">My trips</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
        Manage your booking
      </h1>
      <p class="mt-2 text-sm text-navy-500">
        Look up a trip with your reference and email, then view, update or cancel it.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          lookup(reference, email);
        }}
        class="mt-8 grid gap-4 rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
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
        <Button type="submit" variant="secondary" loading={loading} class="w-full sm:w-auto">
          <Search class="h-4 w-4" /> Find booking
        </Button>
      </form>

      {error ? <Alert tone="error" class="mt-6">{error}</Alert> : null}
      {message ? <Alert tone="success" class="mt-6">{message}</Alert> : null}

      {summaries.length > 0 && !booking ? (
        <div class="mt-6 rounded-2xl border border-navy-100 bg-white p-5">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
            Bookings for {email || user?.email}
          </p>
          <ul class="mt-3 space-y-2">
            {summaries.map((summary) => (
              <li key={summary.id}>
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-xl border border-navy-100 px-4 py-3 text-left text-sm transition-colors hover:border-sky-300 hover:bg-sky-50/40"
                  onClick={() => {
                    setReference(summary.reference);
                    lookup(summary.reference, email || user?.email || "");
                  }}
                >
                  <span class="flex items-center gap-2 font-semibold text-navy-900">
                    <Ticket class="h-4 w-4 text-sky-500" /> {summary.reference}
                  </span>
                  <span class="text-xs text-navy-400">
                    {formatDate(summary.createdAt)}, {formatPrice(summary.total, summary.currency)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {booking ? (
        <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div class="space-y-6">
            <section class="rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Booking reference
                  </p>
                  <p class="text-2xl font-extrabold tracking-[0.1em] text-navy-900">
                    {booking.reference}
                  </p>
                </div>
                <Badge tone={booking.status === "confirmed" ? "emerald" : "amber"}>
                  {caption(booking.status)}
                </Badge>
              </div>

              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl bg-navy-50/70 p-4">
                  <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">Outbound</p>
                  <p class="mt-1 text-sm font-bold text-navy-900">
                    {booking.outboundFlight.from.code} → {booking.outboundFlight.to.code}
                  </p>
                  <p class="text-xs text-navy-500">
                    {formatDate(booking.outboundFlight.departureAt)}, {formatTime(booking.outboundFlight.departureAt)}
                  </p>
                </div>
                {booking.returnFlight ? (
                  <div class="rounded-2xl bg-navy-50/70 p-4">
                    <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">Return</p>
                    <p class="mt-1 text-sm font-bold text-navy-900">
                      {booking.returnFlight.from.code} → {booking.returnFlight.to.code}
                    </p>
                    <p class="text-xs text-navy-500">
                      {formatDate(booking.returnFlight.departureAt)}, {formatTime(booking.returnFlight.departureAt)}
                    </p>
                  </div>
                ) : null}
              </div>

              <div class="mt-5 border-t border-navy-100 pt-4">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-navy-500">Travelers</p>
                <ul class="mt-2 space-y-1 text-sm text-navy-800">
                  {booking.passengers.map((passenger) => (
                    <li key={passenger.id}>{passenger.fullName}</li>
                  ))}
                </ul>
              </div>
            </section>

            <form
              onSubmit={saveContact}
              class="rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
            >
              <h2 class="text-lg font-bold text-navy-900">Update contact details</h2>
              <p class="mb-5 mt-1 text-xs text-navy-400">
                Change the email or phone number on this booking.
              </p>
              <ContactFields
                email={contactEmail}
                phone={contactPhone}
                emailError={contactError}
                onEmail={setContactEmail}
                onPhone={setContactPhone}
              />
              <Button
                type="submit"
                variant="outline"
                loading={saving}
                disabled={booking.status === "cancelled"}
                class="mt-5"
              >
                Save changes
              </Button>
            </form>
          </div>

          <div class="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div class="rounded-2xl border border-navy-100 bg-navy-50/60 p-5">
              <p class="text-xs text-navy-400">Total</p>
              <p class="text-2xl font-extrabold text-navy-900">
                {formatPrice(booking.total, booking.currency)}
              </p>
              <p class="mt-1 text-xs text-navy-400">{caption(booking.tripType)}</p>
            </div>
            <div class="rounded-2xl border border-red-100 bg-red-50/60 p-5">
              <p class="text-sm font-bold text-red-700">Cancel this booking</p>
              <p class="mt-1 text-xs text-red-600">
                Seats will be released back to availability. This cannot be undone.
              </p>
              <Button
                variant="outline"
                class="mt-4 w-full border-red-200 text-red-700 hover:bg-red-50"
                disabled={booking.status !== "confirmed"}
                onClick={() => setConfirmOpen(true)}
              >
                {booking.status === "confirmed" ? "Cancel booking" : "Already cancelled"}
              </Button>
            </div>
            {booking.status === "cancelled" ? (
              <Alert tone="info">
                <CircleCheck class="mr-1 inline h-4 w-4" /> Seats have been restored.
              </Alert>
            ) : null}
          </div>
        </div>
      ) : null}

      {loading ? <Spinner label="Looking up your booking..." /> : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        message={`Booking ${booking?.reference} will be marked cancelled and its seats returned to inventory. This can't be undone.`}
        confirmLabel="Yes, cancel booking"
        loading={cancelling}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={cancel}
      />
    </Container>
  );
}
