import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-preact";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { ContactFields } from "@/components/booking/ContactFields";
import { PassengerFields } from "@/components/booking/PassengerFields";
import { PaymentFields } from "@/components/booking/PaymentFields";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { Spinner } from "@/components/ui/Spinner";
import { ApiRequestError, api } from "@/lib/api";
import { caption, formatTime } from "@/lib/format";
import { firstError, required, validEmail, validPastDate } from "@/lib/validation";
import type { BookingDraft, CabinClass, Flight, PassengerInput, PaymentDetails } from "@/types";

interface PassengerError {
  fullName?: string;
  dateOfBirth?: string;
}

const EMPTY_PAYMENT: PaymentDetails = { cardName: "", cardNumber: "", expiry: "", cvv: "" };

function luhn(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function emptyPassenger(): PassengerInput {
  return { fullName: "", dateOfBirth: "", passportNumber: "" };
}

export function BookingPage() {
  const location = useLocation();
  const outboundId = location.query.outbound;
  const returnId = location.query.return;
  const count = Math.min(9, Math.max(1, Number(location.query.passengers) || 1));
  const cabin = (location.query.cabin ?? "economy") as CabinClass;

  const [outbound, setOutbound] = useState<Flight | null>(null);
  const [returning, setReturning] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(Boolean(outboundId));
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [passengers, setPassengers] = useState<PassengerInput[]>(
    Array.from({ length: count }, emptyPassenger),
  );
  const [passengerErrors, setPassengerErrors] = useState<PassengerError[]>([]);
  const [email, setEmail] = useState(
    typeof sessionStorage !== "undefined" ? sessionStorage.getItem("aerotrip.lastEmail") ?? "" : "",
  );
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();

  const [payment, setPayment] = useState<PaymentDetails>(EMPTY_PAYMENT);
  const [paymentErrors, setPaymentErrors] = useState<Partial<Record<keyof PaymentDetails, string>>>({});
  const [agreed, setAgreed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!outboundId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([
      api.flight(outboundId),
      returnId ? api.flight(returnId) : Promise.resolve(null),
    ])
      .then(([out, ret]) => {
        if (!active) return;
        setOutbound(out);
        setReturning(ret);
      })
      .catch((err: Error) => {
        if (active) setLoadError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [outboundId, returnId]);

  const changePassenger = (index: number, field: keyof PassengerInput, value: string) => {
    setPassengers((current) =>
      current.map((passenger, i) => (i === index ? { ...passenger, [field]: value } : passenger)),
    );
  };

  const validateTravelers = (): boolean => {
    const errors = passengers.map((passenger) => ({
      fullName: firstError(required(passenger.fullName, "Full name")),
      dateOfBirth: firstError(validPastDate(passenger.dateOfBirth, "Date of birth")),
    }));
    setPassengerErrors(errors);
    const mailError = validEmail(email);
    setEmailError(mailError);
    return !errors.some((e) => e.fullName || e.dateOfBirth) && !mailError;
  };

  const toReview = (event: Event) => {
    event.preventDefault();
    setFormError(null);
    if (!validateTravelers()) return;
    setStep(2);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validatePayment = (): boolean => {
    const errors: Partial<Record<keyof PaymentDetails, string>> = {};
    errors.cardName = required(payment.cardName, "Name on card");
    errors.cardNumber = luhn(payment.cardNumber) ? undefined : "Enter a valid card number.";
    const match = /^(\d{2})\/(\d{2})$/.exec(payment.expiry);
    if (!match) {
      errors.expiry = "Use MM/YY.";
    } else {
      const month = Number(match[1]);
      const year = 2000 + Number(match[2]);
      const now = new Date();
      errors.expiry =
        month >= 1 && month <= 12 && (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1))
          ? undefined
          : "Card has expired.";
    }
    errors.cvv = /^\d{3,4}$/.test(payment.cvv) ? undefined : "Enter 3 or 4 digits.";
    setPaymentErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const confirm = (event: Event) => {
    event.preventDefault();
    setFormError(null);
    if (!validatePayment()) return;
    if (!agreed) {
      setFormError("Please accept the booking terms to continue.");
      return;
    }
    if (!outbound) return;

    const draft: BookingDraft = {
      tripType: returnId ? "round-trip" : "one-way",
      outboundFlightId: outbound.id,
      returnFlightId: returnId || undefined,
      cabinClass: outbound.cabinClass,
      contactEmail: email.trim().toLowerCase(),
      contactPhone: phone.trim() || undefined,
      passengers: passengers.map((p) => ({
        fullName: p.fullName.trim(),
        dateOfBirth: p.dateOfBirth,
        passportNumber: p.passportNumber?.trim() || undefined,
      })),
    };

    setSubmitting(true);
    api
      .createBooking(draft)
      .then((booking) => {
        sessionStorage.setItem("aerotrip.lastEmail", draft.contactEmail);
        location.route(`/bookings/${booking.reference}?email=${encodeURIComponent(draft.contactEmail)}`);
      })
      .catch((err: Error | ApiRequestError) => {
        setFormError(
          err instanceof ApiRequestError && err.status === 409
            ? "Those seats are no longer available. Please go back and choose another flight."
            : err.message,
        );
      })
      .finally(() => setSubmitting(false));
  };

  if (!outboundId) {
    return (
      <Container class="py-20">
        <Alert tone="error">No flight selected. Start a search first.</Alert>
        <Button href="/" class="mt-6">Search flights</Button>
      </Container>
    );
  }

  return (
    <Container class="max-w-6xl py-10 sm:py-14">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={location.query.back || "/"}
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-900"
        >
          <ArrowLeft class="h-4 w-4" /> {step === 2 ? "Change flights" : "Back to results"}
        </Link>
        <BookingSteps current={step} />
      </div>

      <h1 class="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
        {step === 1 ? "Who's traveling?" : "Review & pay"}
      </h1>
      <p class="mt-2 text-sm text-navy-500">
        {step === 1
          ? "Enter passenger details exactly as they appear on your travel documents."
          : "Check everything carefully, then confirm your booking."}
      </p>

      {loading ? <Spinner label="Loading itinerary..." /> : null}
      {loadError ? <Alert tone="error" class="mt-6">{loadError}</Alert> : null}

      {!loading && outbound ? (
        <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div class="space-y-6">
            {step === 1 ? (
              <form onSubmit={toReview} class="space-y-6">
                <section class="rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                  <h2 class="text-lg font-bold text-navy-900">Passenger details</h2>
                  <p class="mb-5 mt-1 text-xs text-navy-400">
                    {count} {count === 1 ? "traveler" : "travelers"}, {caption(cabin)} cabin
                  </p>
                  <PassengerFields
                    passengers={passengers}
                    errors={passengerErrors}
                    onChange={changePassenger}
                  />
                </section>

                <section class="rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                  <h2 class="text-lg font-bold text-navy-900">Contact details</h2>
                  <p class="mb-5 mt-1 text-xs text-navy-400">
                    Your reference and itinerary are linked to this email.
                  </p>
                  <ContactFields
                    email={email}
                    phone={phone}
                    emailError={emailError}
                    onEmail={setEmail}
                    onPhone={setPhone}
                  />
                </section>

                {formError ? <Alert tone="error">{formError}</Alert> : null}
                <Button type="submit" variant="secondary" size="lg" class="w-full sm:w-auto">
                  Review booking <ArrowRight class="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={confirm} class="space-y-6">
                <section class="rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                  <h2 class="text-lg font-bold text-navy-900">Your itinerary</h2>
                  <div class="mt-4 space-y-3">
                    <ReviewRow
                      label="Outbound"
                      detail={`${outbound.from.city} → ${outbound.to.city}, ${formatTime(outbound.departureAt)}`}
                      value={outbound.flightNumber}
                    />
                    {returning ? (
                      <ReviewRow
                        label="Return"
                        detail={`${returning.from.city} → ${returning.to.city}, ${formatTime(returning.departureAt)}`}
                        value={returning.flightNumber}
                      />
                    ) : null}
                    <ReviewRow
                      label="Travelers"
                      detail={passengers.map((p) => p.fullName).join(", ")}
                      value={`${count} ${count === 1 ? "adult" : "adults"}`}
                    />
                    <ReviewRow label="Contact" detail={email} value={phone || "—"} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="mt-4 -ml-3"
                    onClick={() => setStep(1)}
                  >
                    Edit traveler & contact details
                  </Button>
                </section>

                <section class="rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                  <PaymentFields
                    values={payment}
                    errors={paymentErrors}
                    onChange={(field, value) =>
                      setPayment((current) => ({ ...current, [field]: value }))
                    }
                  />
                  <label class="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-navy-50/70 p-4 text-xs leading-relaxed text-navy-600">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(event) => setAgreed((event.target as HTMLInputElement).checked)}
                      class="mt-0.5 h-4 w-4 accent-sky-500"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="/legal/terms" class="font-semibold text-sky-600 hover:underline">Terms of Service</Link>{" "}
                      and understand this demo does not charge my card or issue a real ticket.
                    </span>
                  </label>
                </section>

                {formError ? <Alert tone="error">{formError}</Alert> : null}
                <div class="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" variant="secondary" size="lg" loading={submitting} class="flex-1">
                    Confirm & pay <ArrowRight class="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div class="lg:sticky lg:top-28 lg:self-start">
            <PriceSummary outbound={outbound} returning={returning} passengers={count} />
            <p class="mt-4 flex items-center gap-2 text-xs text-navy-400">
              <ShieldCheck class="h-4 w-4 text-emerald-500" />
              {step === 2 ? "Demo checkout — no real charge." : "Free cancellation in My Trips."}
            </p>
          </div>
        </div>
      ) : null}
    </Container>
  );
}

function ReviewRow({ label, detail, value }: { label: string; detail: string; value: string }) {
  return (
    <div class="flex items-start justify-between gap-4 rounded-2xl bg-navy-50/60 p-4">
      <div class="min-w-0">
        <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">{label}</p>
        <p class="mt-1 truncate text-sm font-semibold text-navy-900">{detail}</p>
      </div>
      <p class="shrink-0 text-xs font-semibold text-navy-500">{value}</p>
    </div>
  );
}
