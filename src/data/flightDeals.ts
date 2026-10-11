import type { FlightDeal } from "@/types";

/**
 * Static sample itineraries used purely to demonstrate the deal card layout.
 * These are NOT real schedules or live fares.
 */
export const flightDeals: FlightDeal[] = [
  {
    id: "deal-cgk-dps",
    airline: "Garuda Indonesia",
    airlineCode: "GA",
    from: { city: "Jakarta", code: "CGK" },
    to: { city: "Denpasar", code: "DPS" },
    departureTime: "08:15",
    arrivalTime: "11:10",
    duration: "1h 55m",
    stops: "Direct",
    tripType: "Round trip",
    price: 189,
    badge: { label: "Best Deal", tone: "emerald" },
  },
  {
    id: "deal-cgk-sin",
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    from: { city: "Jakarta", code: "CGK" },
    to: { city: "Singapore", code: "SIN" },
    departureTime: "10:40",
    arrivalTime: "13:25",
    duration: "1h 45m",
    stops: "Direct",
    tripType: "Round trip",
    price: 214,
    badge: { label: "Popular", tone: "sky" },
  },
  {
    id: "deal-cgk-nrt",
    airline: "Japan Airlines",
    airlineCode: "JL",
    from: { city: "Jakarta", code: "CGK" },
    to: { city: "Tokyo", code: "NRT" },
    departureTime: "23:55",
    arrivalTime: "08:15",
    duration: "7h 20m",
    stops: "Direct",
    tripType: "One way",
    price: 468,
    badge: { label: "Limited seats", tone: "amber" },
  },
];
