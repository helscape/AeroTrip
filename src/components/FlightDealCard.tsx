import { ArrowRight, Clock, PlaneTakeoff, Repeat } from "lucide-preact";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { FlightDeal } from "@/types";

interface FlightDealCardProps {
  deal: FlightDeal;
}

export function FlightDealCard({ deal }: FlightDealCardProps) {
  const {
    airline,
    airlineCode,
    from,
    to,
    departureTime,
    arrivalTime,
    duration,
    stops,
    tripType,
    price,
    badge,
  } = deal;

  return (
    <article class="group flex h-full flex-col rounded-3xl border border-navy-100 bg-white p-5 transition-shadow duration-300 hover:shadow-[var(--shadow-card)] sm:p-6">
      {/* Airline */}
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          {/* Logo placeholder */}
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-[11px] font-extrabold tracking-wide text-white">
            {airlineCode}
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-navy-900">{airline}</p>
            <p class="text-xs text-navy-400">Sample itinerary</p>
          </div>
        </div>

        {badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null}
      </div>

      {/* Route */}
      <div class="mt-6 flex items-center gap-3">
        <div class="shrink-0">
          <p class="text-xl font-extrabold tracking-tight text-navy-900">
            {from.code}
          </p>
          <p class="text-xs text-navy-400">{departureTime}</p>
        </div>

        <div class="flex flex-1 flex-col items-center">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-navy-400">
            {duration}
          </span>
          <span class="mt-1 flex w-full items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-navy-200" />
            <span class="h-px flex-1 bg-navy-200" />
            <PlaneTakeoff class="h-3.5 w-3.5 rotate-45 text-sky-500" />
            <span class="h-px flex-1 bg-navy-200" />
            <span class="h-1.5 w-1.5 rounded-full bg-navy-200" />
          </span>
          <span class="mt-1 text-[10px] font-semibold text-sky-600">{stops}</span>
        </div>

        <div class="shrink-0 text-right">
          <p class="text-xl font-extrabold tracking-tight text-navy-900">
            {to.code}
          </p>
          <p class="text-xs text-navy-400">{arrivalTime}</p>
        </div>
      </div>

      <p class="mt-3 text-center text-[11px] text-navy-400">
        {from.city} → {to.city}
      </p>

      {/* Meta */}
      <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-navy-100 pt-5 text-xs font-medium text-navy-500">
        <span class="inline-flex items-center gap-1.5">
          <Clock class="h-3.5 w-3.5 text-navy-300" />
          {duration}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <Repeat class="h-3.5 w-3.5 text-navy-300" />
          {tripType}
        </span>
      </div>

      {/* Price + CTA */}
      <div class="mt-5 flex items-end justify-between gap-4 border-t border-navy-100 pt-5">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
            From
          </p>
          <p class="mt-1 text-2xl font-extrabold tracking-tight text-navy-900">
            ${price}
          </p>
        </div>

        <Button variant="outline" size="sm" href="#" class="group-hover:border-navy-300">
          View Deal
          <ArrowRight class="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}
