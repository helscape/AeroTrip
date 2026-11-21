import { useEffect, useState } from "preact/hooks";
import { useLocation, useRoute } from "preact-iso";
import { CircleCheck, Download, Plane, Printer } from "lucide-preact";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import {
  caption,
  formatDate,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/format";
import type { Booking, Flight } from "@/types";

function Leg({ flight, label }: { flight: Flight; label: string }) {
  return (
    <div class="rounded-2xl border border-navy-100 p-4">
      <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">{label}</p>
      <p class="mt-1 text-sm font-bold text-navy-900">
        {flight.from.city} ({flight.from.code}) → {flight.to.city} ({flight.to.code})
      </p>
      <p class="mt-1 text-xs text-navy-500">
        {formatDate(flight.departureAt)}, {formatTime(flight.departureAt)} –{" "}
        {formatTime(flight.arrivalAt)}, {formatDuration(flight.durationMinutes)}
      </p>
      <p class="mt-1 text-xs text-navy-400">
        {flight.airline.name}, {flight.flightNumber}, {caption(flight.cabinClass)}
      </p>
    </div>
  );
}

export function ConfirmationPage() {
  const { params } = useRoute();
  const location = useLocation();
  const reference = params.reference;
  const [email, setEmail] = useState(
    location.query.email ||
      (typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("aerotrip.lastEmail") ?? ""
        : ""),
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(Boolean(email));
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    api
      .getBooking(reference, email)
      .then((result) => {
        if (active) setBooking(result);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reference, email]);

  const ticketUrl = booking ? api.ticketUrl(booking.reference, email) : "";

  const printTicket = () => {
    if (!ticketUrl) return;
    const win = globalThis.open("", "_blank");
    if (!win) {
      notify("Allow pop-ups to print your ticket.", "error");
      return;
    }
    win.document.write(
      `<!doctype html><html><head><title>Ticket ${booking?.reference}</title>` +
        `<style>@page{size:A4 landscape;margin:8mm}html,body{margin:0;height:100%;background:#fff}` +
        `body{display:grid;place-items:center}img{width:100%;max-width:100%;height:auto}` +
        `</style></head><body><img src="${ticketUrl}" onload="window.print()" />` +
        `</body></html>`,
    );
    win.document.close();
  };

  return (
    <Container class="max-w-4xl py-10 sm:py-14">
      {!email ? (
        <div class="mx-auto max-w-md rounded-3xl border border-navy-100 bg-white p-6 shadow-[var(--shadow-card)]">
          <h1 class="text-2xl font-extrabold text-navy-900">Find your confirmation</h1>
          <p class="mt-2 text-sm text-navy-500">
            Enter the email used for booking {reference}.
          </p>
          <div class="mt-5">
            <TextField label="Contact email" type="email" value={email} onInput={setEmail} required />
          </div>
          <Button class="mt-5 w-full" onClick={() => setEmail(email.trim())}>
            Show booking
          </Button>
        </div>
      ) : null}

      {loading ? <Spinner label="Loading your booking..." /> : null}

      {error ? (
        <Alert tone="error" class="mt-6">
          {error}. Check the reference and email, or manage your booking below.
        </Alert>
      ) : null}

      {!loading && booking ? (
        <>
          <div class="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 text-center sm:p-8">
            <CircleCheck class="mx-auto h-12 w-12 text-emerald-500" />
            <h1 class="mt-4 text-2xl font-extrabold text-navy-900 sm:text-3xl">
              You're booked!
            </h1>
            <p class="mt-2 text-sm text-navy-500">
              A confirmation has been recorded for this booking. No payment was collected.
            </p>
            <div class="mt-5 inline-flex flex-col items-center rounded-2xl border border-emerald-200 bg-white px-6 py-3">
              <span class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
                Booking reference
              </span>
              <span class="text-3xl font-extrabold tracking-[0.12em] text-navy-900">
                {booking.reference}
              </span>
            </div>
            <div class="mt-4">
              <Badge tone={booking.status === "confirmed" ? "emerald" : "amber"}>
                {caption(booking.status)}
              </Badge>
            </div>
          </div>

          <div class="mt-8 grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <Leg flight={booking.outboundFlight} label="Outbound" />
              {booking.returnFlight ? (
                <Leg flight={booking.returnFlight} label="Return" />
              ) : null}
            </div>

            <div class="rounded-2xl border border-navy-100 bg-white p-5">
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
                Travelers
              </p>
              <ul class="mt-3 space-y-2">
                {booking.passengers.map((passenger) => (
                  <li key={passenger.id} class="text-sm text-navy-800">
                    <span class="font-semibold">{passenger.fullName}</span>
                    <span class="block text-xs text-navy-400">
                      Born {passenger.dateOfBirth}
                      {passenger.passportNumber ? `, passport ${passenger.passportNumber}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <div class="mt-5 border-t border-navy-100 pt-4">
                <p class="text-xs text-navy-400">Contact</p>
                <p class="text-sm font-semibold text-navy-800">{booking.contactEmail}</p>
                {booking.contactPhone ? (
                  <p class="text-xs text-navy-500">{booking.contactPhone}</p>
                ) : null}
              </div>
              <div class="mt-5 flex items-end justify-between border-t border-navy-100 pt-4">
                <span class="text-sm font-semibold text-navy-600">Total paid</span>
                <span class="text-2xl font-extrabold text-navy-900">
                  {formatPrice(booking.total, booking.currency)}
                </span>
              </div>
            </div>
          </div>

          <section class="mt-8 rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-bold text-navy-900">Boarding pass</h2>
                <p class="mt-1 text-xs text-navy-400">
                  Generated from your booking. Print it or save it as a PNG.
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <a
                  href={ticketUrl}
                  download={`aerotrip-${booking.reference}.png`}
                  class="inline-flex h-10 items-center gap-2 rounded-full border border-navy-200 bg-white px-4 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                >
                  <Download class="h-4 w-4" /> Download
                </a>
                <Button variant="outline" onClick={printTicket}>
                  <Printer class="h-4 w-4" /> Print ticket
                </Button>
              </div>
            </div>
            <img
              src={ticketUrl}
              alt={`Boarding pass for booking ${booking.reference}`}
              class="mt-5 w-full rounded-2xl border border-navy-100"
            />
          </section>

          <div class="mt-8 flex flex-wrap gap-3">
            <Button
              href={`/manage?reference=${encodeURIComponent(booking.reference)}&email=${encodeURIComponent(booking.contactEmail)}`}
            >
              Manage booking
            </Button>
            <Button href="/" variant="outline">
              <Plane class="h-4 w-4" /> Search another trip
            </Button>
          </div>
          <p class="mt-6 text-center text-xs text-navy-400">
            Keep this reference safe — you can also find your booking from the{" "}
            <Link href="/manage" class="font-semibold text-sky-600 hover:underline">
              Manage Booking
            </Link>{" "}
            page.
          </p>
        </>
      ) : null}
    </Container>
  );
}
