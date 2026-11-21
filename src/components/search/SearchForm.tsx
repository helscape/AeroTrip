import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { ArrowRightLeft, MapPin, Search, Users } from "lucide-preact";
import { api } from "@/lib/api";
import { caption, isoDatePlus } from "@/lib/format";
import type { ApiAirport, CabinClass, SearchParams, TripType } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import { SelectField } from "@/components/ui/SelectField";

interface SearchFormProps {
  initial?: Partial<SearchParams>;
}

const CABINS: CabinClass[] = ["economy", "premium", "business", "first"];

const FIELD_BASE =
  "flex min-h-[4.5rem] w-full flex-col justify-center rounded-2xl border border-navy-100 bg-white px-4 py-2.5 transition-colors hover:border-sky-300 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100";

export function SearchForm({ initial = {} }: SearchFormProps) {
  const { route } = useLocation();
  const [airports, setAirports] = useState<ApiAirport[]>([]);
  const [tripType, setTripType] = useState<TripType>(
    initial.returnDate ? "round-trip" : "one-way",
  );
  const [origin, setOrigin] = useState(initial.origin ?? "CGK");
  const [destination, setDestination] = useState(initial.destination ?? "DPS");
  const [departDate, setDepartDate] = useState(initial.departDate ?? isoDatePlus(14));
  const [returnDate, setReturnDate] = useState(initial.returnDate ?? isoDatePlus(21));
  const [passengers, setPassengers] = useState(initial.passengers ?? 1);
  const [cabin, setCabin] = useState<CabinClass>(initial.cabin ?? "economy");
  const [travelerOpen, setTravelerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.airports().then(setAirports).catch(() => {
      /* the search still works with the default codes if lookup fails */
    });
  }, []);

  const airportOptions = airports.length
    ? airports.map((a) => ({ value: a.code, label: `${a.city} (${a.code})` }))
    : [
        { value: "CGK", label: "Jakarta (CGK)" },
        { value: "DPS", label: "Denpasar (DPS)" },
      ];

  const submit = (event: Event) => {
    event.preventDefault();
    if (!origin || !destination || origin === destination) {
      setError("Choose two different airports.");
      return;
    }
    if (!departDate) {
      setError("Choose a departure date.");
      return;
    }
    if (tripType === "round-trip" && (!returnDate || returnDate < departDate)) {
      setError("Return date must be on or after departure.");
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      origin,
      destination,
      departDate,
      passengers: String(passengers),
      cabin,
    });
    if (tripType === "round-trip") params.set("returnDate", returnDate);
    route(`/search?${params.toString()}`);
  };

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <form
      id="flights"
      onSubmit={submit}
      class="rounded-[1.75rem] border border-navy-100 bg-white p-4 shadow-[var(--shadow-float)] sm:p-5"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="inline-flex rounded-full bg-navy-50 p-1" role="group" aria-label="Trip type">
          {(["round-trip", "one-way"] as TripType[]).map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={tripType === type}
              onClick={() => setTripType(type)}
              class={`rounded-full px-5 py-2 text-xs font-bold transition-colors ${
                tripType === type
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-navy-500 hover:text-navy-900"
              }`}
            >
              {type === "round-trip" ? "Round trip" : "One way"}
            </button>
          ))}
        </div>
        <p class="flex items-center gap-1.5 text-[11px] font-medium text-navy-400">
          <MapPin class="h-3.5 w-3.5 text-sky-500" /> Sample routes from Jakarta
        </p>
      </div>

      <div class="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-6">
        <div class="relative">
          <SelectField label="From" value={origin} options={airportOptions} onChange={setOrigin} />
          <button
            type="button"
            aria-label="Swap origin and destination"
            title="Swap airports"
            onClick={swap}
            class="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-navy-200 bg-white text-navy-600 shadow-sm transition-colors hover:border-sky-400 hover:text-sky-600 sm:grid"
          >
            <ArrowRightLeft class="h-3.5 w-3.5" />
          </button>
        </div>

        <div>
          <SelectField label="To" value={destination} options={airportOptions} onChange={setDestination} />
        </div>

        <DateField label="Depart" value={departDate} onInput={setDepartDate} min={isoDatePlus(0)} />

        <div class={tripType === "one-way" ? "opacity-60" : undefined}>
          <DateField
            label="Return"
            value={returnDate}
            onInput={setReturnDate}
            min={departDate}
          />
        </div>

        <div class="relative">
          <button
            type="button"
            class={`${FIELD_BASE} text-left`}
            aria-expanded={travelerOpen}
            onClick={() => setTravelerOpen(!travelerOpen)}
          >
            <span class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
              Travelers & cabin
            </span>
            <span class="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-navy-900">
              <Users class="h-3.5 w-3.5 shrink-0 text-sky-500" />
              {passengers} {passengers === 1 ? "traveler" : "travelers"}, {caption(cabin)}
            </span>
          </button>
          {travelerOpen ? (
            <>
              <button
                type="button"
                aria-label="Close traveler options"
                class="fixed inset-0 z-20 cursor-default"
                onClick={() => setTravelerOpen(false)}
              />
              <div class="absolute left-0 right-0 top-full z-30 mt-2 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-navy-100 bg-white p-4 shadow-[var(--shadow-float)]">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-bold text-navy-900">Travelers</p>
                    <p class="text-xs text-navy-400">Ages 12 and above</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Remove traveler"
                      disabled={passengers <= 1}
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      class="grid h-8 w-8 place-items-center rounded-full border border-navy-100 font-bold text-navy-600 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span class="w-5 text-center text-sm font-bold text-navy-900">
                      {passengers}
                    </span>
                    <button
                      type="button"
                      aria-label="Add traveler"
                      disabled={passengers >= 9}
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      class="grid h-8 w-8 place-items-center rounded-full border border-navy-100 font-bold text-navy-600 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div class="mt-4 border-t border-navy-100 pt-4">
                  <p class="text-sm font-bold text-navy-900">Cabin class</p>
                  <div class="mt-2 grid grid-cols-2 gap-2">
                    {CABINS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCabin(option)}
                        class={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                          cabin === option
                            ? "border-sky-400 bg-sky-50 text-sky-700"
                            : "border-navy-100 text-navy-600 hover:border-navy-200"
                        }`}
                      >
                        {caption(option)}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  class="mt-4 w-full"
                  onClick={() => setTravelerOpen(false)}
                >
                  Done
                </Button>
              </div>
            </>
          ) : null}
        </div>

        <div class="flex items-end">
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            class="h-[4.5rem] w-full text-base"
          >
            <Search class="h-4 w-4" /> Search flights
          </Button>
        </div>
      </div>

      {error ? <Alert tone="error" class="mt-4">{error}</Alert> : null}
    </form>
  );
}
