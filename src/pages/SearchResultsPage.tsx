import { useEffect, useMemo, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { ArrowRight, PlaneTakeoff } from "lucide-preact";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { Spinner } from "@/components/ui/Spinner";
import {
  FlightResultCard,
} from "@/components/search/FlightResultCard";
import { ResultsFilters, type FilterState } from "@/components/search/ResultsFilters";
import { SearchForm } from "@/components/search/SearchForm";
import { api } from "@/lib/api";
import { formatShortDate } from "@/lib/format";
import { parseSearchParams, searchQuery } from "@/lib/search";
import type { Flight, SearchParams, SearchResult } from "@/types";

const DEFAULT_FILTERS: FilterState = {
  maxStops: "any",
  airline: "any",
  maxPrice: "any",
  sort: "price",
};

function applyFilters(flights: Flight[], filters: FilterState): Flight[] {
  const result = flights.filter((flight) => {
    if (filters.maxStops !== "any" && flight.stops > Number(filters.maxStops)) return false;
    if (filters.airline !== "any" && flight.airline.code !== filters.airline) return false;
    if (filters.maxPrice !== "any" && flight.price > Number(filters.maxPrice)) return false;
    return true;
  });
  return result.sort((a, b) => {
    if (filters.sort === "duration") return a.durationMinutes - b.durationMinutes || a.price - b.price;
    if (filters.sort === "departure") return a.departureAt.localeCompare(b.departureAt);
    return a.price - b.price;
  });
}

export function SearchResultsPage() {
  const location = useLocation();
  const initial = useMemo(() => parseSearchParams(location.query), [location.url]);
  const params: Partial<SearchParams> = initial;
  const hasCriteria = Boolean(params.origin && params.destination && params.departDate);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(hasCriteria);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutbound, setSelectedOutbound] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null);

  useEffect(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedOutbound(null);
    setSelectedReturn(null);
    if (!hasCriteria) {
      setLoading(false);
      setData(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    api
      .search({
        origin: params.origin,
        destination: params.destination,
        departDate: params.departDate,
        returnDate: params.returnDate,
        passengers: params.passengers,
        cabin: params.cabin,
      })
      .then((result) => {
        if (active) setData(result);
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
  }, [location.url]);

  const outbound = data ? applyFilters(data.outbound, filters) : [];
  const returning = data?.return ? applyFilters(data.return, filters) : [];
  const airlines = useMemo(() => {
    const all = [...(data?.outbound ?? []), ...(data?.return ?? [])];
    return Array.from(
      new Map(all.map((f) => [f.airline.code, f.airline])).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const isRoundTrip = Boolean(params.returnDate);
  const canContinue = Boolean(
    selectedOutbound && (!isRoundTrip || selectedReturn) && params.cabin && params.passengers,
  );

  const continueToBooking = () => {
    if (!canContinue || !params.cabin || !params.passengers) return;
    const query = new URLSearchParams({
      outbound: selectedOutbound as string,
      passengers: String(params.passengers),
      cabin: params.cabin,
    });
    if (selectedReturn) query.set("return", selectedReturn);
    location.route(`/booking?${query.toString()}`);
  };

  const detailHref = (flight: Flight) =>
    `/flights/${flight.id}?${hasCriteria ? searchQuery(params as SearchParams) : ""}`;

  return (
    <Container class="py-10 sm:py-14">
      <div class="mb-8 max-w-3xl">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">
          Flight search
        </p>
        <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          {hasCriteria
            ? `${params.origin} → ${params.destination}`
            : "Find your next flight"}
        </h1>
        <p class="mt-2 text-sm text-navy-500">
          {hasCriteria
            ? `${formatShortDate(`${params.departDate}T00:00:00.000Z`)}, ${params.passengers} ${params.passengers === 1 ? "traveler" : "travelers"}, ${params.cabin}`
            : "Enter your route and dates to see live sample availability."}
        </p>
      </div>

      <SearchForm initial={initial} />

      {error ? (
        <Alert tone="error" class="mt-6">
          {error}. Make sure the API is running, then try again.
        </Alert>
      ) : null}

      {loading ? <Spinner label="Searching flights..." /> : null}

      {!loading && !hasCriteria ? (
        <Alert tone="info" class="mt-6">
          Fill in the form above to search for flights.
        </Alert>
      ) : null}

      {!loading && hasCriteria && data ? (
        <>
          <div class="mt-8">
            <ResultsFilters filters={filters} airlines={airlines} onChange={setFilters} />
          </div>

          {outbound.length === 0 ? (
            <Alert tone="info" class="mt-6">
              No outbound flights match your filters. Try widening your search.
            </Alert>
          ) : (
            <section class="mt-8">
              <h2 class="mb-4 flex items-center gap-2 text-lg font-bold text-navy-900">
                <PlaneTakeoff class="h-5 w-5 text-sky-500" />
                Departure {params.origin} → {params.destination}
                <span class="text-sm font-medium text-navy-400">({outbound.length})</span>
              </h2>
              <div class="grid gap-3">
                {outbound.map((flight) => (
                  <FlightResultCard
                    key={flight.id}
                    flight={flight}
                    selected={selectedOutbound === flight.id}
                    onSelect={() => setSelectedOutbound(flight.id)}
                    detailHref={detailHref(flight)}
                  />
                ))}
              </div>
            </section>
          )}

          {isRoundTrip ? (
            <section class="mt-10">
              <h2 class="mb-4 flex items-center gap-2 text-lg font-bold text-navy-900">
                <PlaneTakeoff class="h-5 w-5 rotate-180 text-sky-500" />
                Return {params.destination} → {params.origin}
                <span class="text-sm font-medium text-navy-400">({returning.length})</span>
              </h2>
              {returning.length === 0 ? (
                <Alert tone="info">No return flights match your filters.</Alert>
              ) : (
                <div class="grid gap-3">
                  {returning.map((flight) => (
                    <FlightResultCard
                      key={flight.id}
                      flight={flight}
                      selected={selectedReturn === flight.id}
                      onSelect={() => setSelectedReturn(flight.id)}
                      detailHref={detailHref(flight)}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <div class="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-navy-100 bg-navy-50/60 p-5 sm:flex-row sm:items-center">
            <p class="text-sm text-navy-600">
              {canContinue
                ? "Itinerary selected — continue to passenger details."
                : isRoundTrip
                  ? "Select an outbound and a return flight to continue."
                  : "Select an outbound flight to continue."}
            </p>
            <Button
              variant="secondary"
              disabled={!canContinue}
              onClick={continueToBooking}
              class="w-full sm:w-auto"
            >
              Continue <ArrowRight class="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : null}

      <p class="mt-8 text-center text-xs text-navy-400">
        Need to change something?{" "}
        <Link href="/" class="font-semibold text-sky-600 hover:underline">
          Start a new search
        </Link>
        .
      </p>
    </Container>
  );
}
