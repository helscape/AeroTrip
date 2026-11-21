import { SlidersHorizontal } from "lucide-preact";
import { SelectField } from "@/components/ui/SelectField";

export interface FilterState {
  maxStops: string;
  airline: string;
  maxPrice: string;
  sort: "price" | "duration" | "departure";
}

interface ResultsFiltersProps {
  filters: FilterState;
  airlines: Array<{ code: string; name: string }>;
  onChange: (filters: FilterState) => void;
}

export function ResultsFilters({ filters, airlines, onChange }: ResultsFiltersProps) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div class="rounded-2xl border border-navy-100 bg-white p-4 shadow-[var(--shadow-card)]">
      <p class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
        <SlidersHorizontal class="h-3.5 w-3.5" /> Filters
      </p>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SelectField
          label="Stops"
          value={filters.maxStops}
          options={[
            { value: "any", label: "Any" },
            { value: "0", label: "Direct only" },
            { value: "1", label: "Up to 1 stop" },
          ]}
          onChange={(v) => set("maxStops", v)}
        />
        <SelectField
          label="Airline"
          value={filters.airline}
          options={[
            { value: "any", label: "All airlines" },
            ...airlines.map((a) => ({ value: a.code, label: a.name })),
          ]}
          onChange={(v) => set("airline", v)}
        />
        <SelectField
          label="Max price"
          value={filters.maxPrice}
          options={[
            { value: "any", label: "Any price" },
            { value: "150", label: "Under $150" },
            { value: "250", label: "Under $250" },
            { value: "500", label: "Under $500" },
            { value: "1000", label: "Under $1,000" },
          ]}
          onChange={(v) => set("maxPrice", v)}
        />
        <SelectField
          label="Sort by"
          value={filters.sort}
          options={[
            { value: "price", label: "Lowest price" },
            { value: "duration", label: "Shortest flight" },
            { value: "departure", label: "Earliest departure" },
          ]}
          onChange={(v) => set("sort", v as FilterState["sort"])}
        />
      </div>
    </div>
  );
}
