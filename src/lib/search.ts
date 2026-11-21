import type { CabinClass, SearchParams } from "@/types";

const CABINS: CabinClass[] = ["economy", "premium", "business", "first"];

export function parseSearchParams(query: Record<string, string>): Partial<SearchParams> {
  const passengers = Number(query.passengers);
  return {
    origin: query.origin || undefined,
    destination: query.destination || undefined,
    departDate: query.departDate || undefined,
    returnDate: query.returnDate || undefined,
    passengers: Number.isFinite(passengers) && passengers >= 1 ? passengers : undefined,
    cabin: CABINS.includes(query.cabin as CabinClass) ? (query.cabin as CabinClass) : undefined,
  };
}

export function searchQuery(params: SearchParams): string {
  const query = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    departDate: params.departDate,
    passengers: String(params.passengers),
    cabin: params.cabin,
  });
  if (params.returnDate) query.set("returnDate", params.returnDate);
  return query.toString();
}
