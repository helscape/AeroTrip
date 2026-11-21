import { useEffect, useState } from "preact/hooks";
import { useLocation, useRoute } from "preact-iso";
import { ArrowLeft, Clock3, Luggage, PlaneTakeoff } from "lucide-preact";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import {
  caption,
  formatDate,
  formatDuration,
  formatPrice,
  formatTime,
  stopsLabel,
} from "@/lib/format";
import { parseSearchParams, searchQuery } from "@/lib/search";
import type { Flight, SearchParams } from "@/types";

export function FlightDetailPage() {
  const routeInfo = useRoute();
  const location = useLocation();
  const flightId = routeInfo.params.id;
  const initial = parseSearchParams(location.query);
  const hasCriteria = Boolean(initial.origin && initial.destination && initial.departDate);

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .flight(flightId)
      .then((result) => {
        if (active) setFlight(result);
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
  }, [flightId]);

  const backHref = hasCriteria ? `/search?${searchQuery(initial as SearchParams)}` : "/";
  const bookHref = (() => {
    const query = new URLSearchParams({
      outbound: flightId,
      passengers: String(initial.passengers ?? 1),
      cabin: initial.cabin ?? flight?.cabinClass ?? "economy",
    });
    return `/booking?${query.toString()}`;
  })();

  return (
    <Container class="max-w-4xl py-10 sm:py-14">
      <Link
        href={backHref}
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-900"
      >
        <ArrowLeft class="h-4 w-4" /> Back to results
      </Link>

      {loading ? <Spinner label="Loading flight details..." /> : null}

      {error ? (
        <Alert tone="error" class="mt-6">
          {error}
        </Alert>
      ) : null}

      {!loading && flight ? (
        <div class="mt-6 rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <span class="grid h-14 w-14 place-items-center rounded-2xl bg-navy-900 text-sm font-bold text-white">
                {flight.airline.code}
              </span>
              <div>
                <h1 class="text-2xl font-extrabold text-navy-900">{flight.airline.name}</h1>
                <p class="text-sm text-navy-400">
                  {flight.flightNumber}, {caption(flight.cabinClass)}
                </p>
              </div>
            </div>
            <Badge tone={flight.stops === 0 ? "emerald" : "amber"}>
              {stopsLabel(flight.stops)}
            </Badge>
          </div>

          <div class="mt-8 rounded-2xl bg-navy-50/70 p-5 sm:p-6">
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
              {formatDate(flight.departureAt)}
            </p>
            <div class="mt-4 flex items-center gap-4 sm:gap-8">
              <div>
                <p class="text-3xl font-extrabold text-navy-900">
                  {formatTime(flight.departureAt)}
                </p>
                <p class="text-sm font-semibold text-navy-600">{flight.from.code}</p>
                <p class="text-xs text-navy-400">{flight.from.city}</p>
              </div>
              <div class="flex-1 text-center">
                <div class="flex items-center gap-2 text-navy-300">
                  <span class="h-1.5 w-1.5 rounded-full bg-navy-300" />
                  <span class="h-px flex-1 bg-navy-200" />
                  <PlaneTakeoff class="h-4 w-4 rotate-90 text-sky-500" />
                  <span class="h-px flex-1 bg-navy-200" />
                  <span class="h-1.5 w-1.5 rounded-full bg-navy-300" />
                </div>
                <p class="mt-2 text-xs font-medium text-navy-500">
                  {formatDuration(flight.durationMinutes)}
                </p>
              </div>
              <div class="text-right">
                <p class="text-3xl font-extrabold text-navy-900">
                  {formatTime(flight.arrivalAt)}
                </p>
                <p class="text-sm font-semibold text-navy-600">{flight.to.code}</p>
                <p class="text-xs text-navy-400">{flight.to.city}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-navy-100 p-4">
              <Clock3 class="h-4 w-4 text-sky-500" />
              <p class="mt-2 text-xs text-navy-400">Duration</p>
              <p class="text-sm font-bold text-navy-900">
                {formatDuration(flight.durationMinutes)}
              </p>
            </div>
            <div class="rounded-2xl border border-navy-100 p-4">
              <PlaneTakeoff class="h-4 w-4 text-sky-500" />
              <p class="mt-2 text-xs text-navy-400">Stops</p>
              <p class="text-sm font-bold text-navy-900">{stopsLabel(flight.stops)}</p>
            </div>
            <div class="rounded-2xl border border-navy-100 p-4">
              <Luggage class="h-4 w-4 text-sky-500" />
              <p class="mt-2 text-xs text-navy-400">Availability</p>
              <p class="text-sm font-bold text-navy-900">
                {flight.seatsAvailable} seats left
              </p>
            </div>
          </div>

          <div class="mt-8 flex flex-col items-start justify-between gap-4 border-t border-navy-100 pt-6 sm:flex-row sm:items-center">
            <div>
              <p class="text-xs text-navy-400">Price per traveler</p>
              <p class="text-3xl font-extrabold text-navy-900">
                {formatPrice(flight.price, flight.currency)}
              </p>
            </div>
            <Button href={bookHref} variant="secondary" size="lg">
              Book this flight
            </Button>
          </div>
        </div>
      ) : null}
    </Container>
  );
}
