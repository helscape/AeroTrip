import {
  Armchair,
  CalendarClock,
  CalendarDays,
  PlaneLanding,
  PlaneTakeoff,
  Search,
  Users,
} from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { FieldVisual } from "@/components/ui/FieldVisual";

const tripTypes = [
  { id: "round-trip", label: "Round Trip", active: true },
  { id: "one-way", label: "One Way", active: false },
  { id: "multi-city", label: "Multi-City", active: false },
];

const routeFields = [
  {
    id: "from",
    icon: <PlaneTakeoff class="h-4 w-4" />,
    label: "From",
    value: "Jakarta (CGK)",
    hint: "Soekarno–Hatta Intl",
  },
  {
    id: "to",
    icon: <PlaneLanding class="h-4 w-4" />,
    label: "To",
    value: "Denpasar (DPS)",
    hint: "Ngurah Rai Intl",
  },
  {
    id: "departure",
    icon: <CalendarDays class="h-4 w-4" />,
    label: "Departure",
    value: "Fri, 14 Mar 2026",
    hint: "Any time",
  },
  {
    id: "return",
    icon: <CalendarClock class="h-4 w-4" />,
    label: "Return",
    value: "Sun, 23 Mar 2026",
    hint: "Any time",
  },
];

export function FlightSearchCard() {
  return (
    <div
      id="flights"
      class="rounded-3xl border border-navy-100 bg-white p-4 shadow-[var(--shadow-float)] sm:p-6"
    >
      {/* Trip type selector — visual only */}
      <div
        class="inline-flex w-full items-center gap-1 rounded-full bg-navy-50 p-1 sm:w-auto"
        role="group"
        aria-label="Trip type"
      >
        {tripTypes.map((trip) => (
          <span
            key={trip.id}
            class={`flex-1 rounded-full px-4 py-2 text-center text-xs font-semibold transition-colors duration-200 sm:flex-none ${
              trip.active
                ? "bg-white text-navy-900 shadow-sm"
                : "text-navy-500 hover:text-navy-800"
            }`}
          >
            {trip.label}
          </span>
        ))}
      </div>

      {/* Route + dates */}
      <div class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {routeFields.map((field) => (
          <FieldVisual
            key={field.id}
            icon={field.icon}
            label={field.label}
            value={field.value}
            hint={field.hint}
          />
        ))}
      </div>

      {/* Passengers + cabin + action */}
      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FieldVisual
          icon={<Users class="h-4 w-4" />}
          label="Passengers"
          value="1 Passenger"
          hint="Adult"
        />

        <FieldVisual
          icon={<Armchair class="h-4 w-4" />}
          label="Cabin Class"
          value="Economy"
          hint="Lowest fare"
        />

        <div class="md:col-span-2">
          <Button
            variant="secondary"
            size="lg"
            class="h-full min-h-[3.75rem] w-full"
            aria-label="Search flights"
          >
            <Search class="h-4 w-4" />
            Search Flights
          </Button>
        </div>
      </div>
    </div>
  );
}
