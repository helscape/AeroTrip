import { ArrowRight, Clock3, Luggage } from "lucide-preact";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import {
  caption,
  formatDuration,
  formatPrice,
  formatTime,
  stopsLabel,
} from "@/lib/format";
import type { Flight } from "@/types";

interface FlightResultCardProps {
  flight: Flight;
  selected: boolean;
  onSelect: () => void;
  detailHref: string;
}

export function FlightResultCard({
  flight,
  selected,
  onSelect,
  detailHref,
}: FlightResultCardProps) {
  return (
    <article
      class={`rounded-2xl border bg-white p-4 transition-all sm:p-5 ${
        selected
          ? "border-sky-400 shadow-[var(--shadow-card)] ring-2 ring-sky-100"
          : "border-navy-100 hover:border-sky-200 hover:shadow-[var(--shadow-card)]"
      }`}
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-xs font-bold text-white">
            {flight.airline.code}
          </span>
          <div>
            <p class="text-sm font-bold text-navy-900">{flight.airline.name}</p>
            <p class="text-xs text-navy-400">{flight.flightNumber}</p>
          </div>
        </div>

        <Badge tone={flight.stops === 0 ? "emerald" : "amber"}>
          {stopsLabel(flight.stops)}
        </Badge>
      </div>

      <div class="mt-5 flex items-center gap-3 sm:gap-6">
        <div class="text-center">
          <p class="text-xl font-extrabold text-navy-900">{formatTime(flight.departureAt)}</p>
          <p class="text-xs font-semibold text-navy-500">{flight.from.code}</p>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 text-navy-300">
            <span class="h-1.5 w-1.5 rounded-full bg-navy-300" />
            <span class="h-px flex-1 bg-navy-200" />
            <ArrowRight class="h-3.5 w-3.5" />
            <span class="h-px flex-1 bg-navy-200" />
            <span class="h-1.5 w-1.5 rounded-full bg-navy-300" />
          </div>
          <p class="mt-1.5 text-center text-[11px] font-medium text-navy-400">
            {formatDuration(flight.durationMinutes)}
          </p>
        </div>
        <div class="text-center">
          <p class="text-xl font-extrabold text-navy-900">{formatTime(flight.arrivalAt)}</p>
          <p class="text-xs font-semibold text-navy-500">{flight.to.code}</p>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-navy-100 pt-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
            {caption(flight.cabinClass)}, {flight.seatsAvailable} seats left
          </p>
          <p class="mt-0.5 text-2xl font-extrabold text-navy-900">
            {formatPrice(flight.price, flight.currency)}
            <span class="text-xs font-medium text-navy-400"> / traveler</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Link
            href={detailHref}
            class="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-navy-600 hover:bg-navy-50"
          >
            <Clock3 class="h-3.5 w-3.5" /> Details
          </Link>
          <Button variant={selected ? "outline" : "secondary"} size="sm" onClick={onSelect}>
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
      <p class="mt-3 flex items-center gap-1.5 text-[11px] text-navy-400">
        <Luggage class="h-3 w-3" /> Carry-on included. Sample inventory
      </p>
    </article>
  );
}
