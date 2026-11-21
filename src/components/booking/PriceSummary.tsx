import { formatDuration, formatPrice, formatShortDate, stopsLabel } from "@/lib/format";
import type { Flight } from "@/types";

interface PriceSummaryProps {
  outbound: Flight;
  returning: Flight | null;
  passengers: number;
}

export function PriceSummary({ outbound, returning, passengers }: PriceSummaryProps) {
  const currency = outbound.currency;
  const fare = outbound.price + (returning?.price ?? 0);
  const total = fare * passengers;

  const row = (label: string, flight: Flight) => (
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-navy-900">{label}</p>
        <p class="text-xs text-navy-400">
          {formatShortDate(flight.departureAt)}, {flight.from.code} → {flight.to.code},{" "}
          {formatDuration(flight.durationMinutes)}, {stopsLabel(flight.stops)}
        </p>
      </div>
      <p class="text-sm font-bold text-navy-900">{formatPrice(flight.price, currency)}</p>
    </div>
  );

  return (
    <div class="rounded-2xl border border-navy-100 bg-navy-50/60 p-5">
      <p class="text-xs font-bold uppercase tracking-[0.14em] text-navy-500">Price summary</p>
      <div class="mt-4 space-y-3">
        {row("Outbound", outbound)}
        {returning ? row("Return", returning) : null}
        <div class="border-t border-navy-200 pt-3 text-sm text-navy-600">
          <div class="flex justify-between">
            <span>
              {passengers} {passengers === 1 ? "traveler" : "travelers"}
            </span>
            <span>× {formatPrice(fare, currency)}</span>
          </div>
        </div>
      </div>
      <div class="mt-4 flex items-end justify-between border-t border-navy-200 pt-4">
        <span class="text-sm font-semibold text-navy-700">Total</span>
        <span class="text-2xl font-extrabold text-navy-900">{formatPrice(total, currency)}</span>
      </div>
      <p class="mt-3 text-[11px] leading-relaxed text-navy-400">
        No payment is collected in this demo. Your booking is confirmed instantly.
      </p>
    </div>
  );
}
