/**
 * Shared domain types.
 *
 * These are intentionally shaped like the entities a future API / database
 * layer would return, so presentational components can be swapped from
 * mock data to real data without a redesign.
 */

export interface Destination {
  id: string;
  code: string;
  city: string;
  country: string;
  description: string;
  image: string;
  imageAlt: string;
  /** Indicative placeholder price in USD. */
  startingPrice: number;
  tag?: string;
}

export interface Airport {
  city: string;
  code: string;
}

export type DealBadgeTone = "sky" | "navy" | "emerald" | "amber";

export interface FlightDeal {
  id: string;
  airline: string;
  /** Two-letter airline code used as a logo placeholder. */
  airlineCode: string;
  from: Airport;
  to: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  tripType: string;
  /** Indicative placeholder price in USD. */
  price: number;
  badge?: {
    label: string;
    tone: DealBadgeTone;
  };
}

export type FeatureIconName = "search" | "wallet" | "calendar" | "zap";

export interface Feature {
  id: string;
  icon: FeatureIconName;
  title: string;
  description: string;
}

export interface Inspiration {
  id: string;
  title: string;
  description: string;
  meta: string;
  image: string;
  imageAlt: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface SocialLink {
  label: string;
  href: string;
}

/* -------------------------------------------------------------------------- */
/* API / booking domain                                                        */
/* -------------------------------------------------------------------------- */

export type CabinClass = "economy" | "premium" | "business" | "first";
export type TripType = "one-way" | "round-trip";
export type BookingStatus = "confirmed" | "cancelled" | "completed";

export interface ApiAirport {
  code: string;
  city: string;
  country: string;
  name: string;
}

export interface ApiAirline {
  code: string;
  name: string;
}

/** A flight exactly as returned by GET /api/flights/*. */
export interface Flight {
  id: string;
  airline: ApiAirline;
  flightNumber: string;
  from: ApiAirport;
  to: ApiAirport;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  stops: number;
  cabinClass: CabinClass;
  price: number;
  currency: string;
  seatsAvailable: number;
}

export interface SearchResult {
  outbound: Flight[];
  return: Flight[] | null;
}

export interface Passenger {
  id: string;
  fullName: string;
  dateOfBirth: string;
  passportNumber: string | null;
  seatNo: string | null;
}

export interface PassengerInput {
  fullName: string;
  dateOfBirth: string;
  passportNumber?: string;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  tripType: TripType;
  outboundFlight: Flight;
  returnFlight: Flight | null;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string | null;
  total: number;
  currency: string;
  createdAt: string;
}

export interface BookingSummary {
  id: string;
  reference: string;
  status: BookingStatus;
  tripType: TripType;
  contactEmail: string;
  total: number;
  currency: string;
  createdAt: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabin: CabinClass;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "user" | "admin";
  createdAt: string;
}

export interface TokenResponse {
  token: string;
  user: User;
}

export interface PaymentDetails {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface BookingDraft {
  tripType: TripType;
  outboundFlightId: string;
  returnFlightId?: string;
  cabinClass: CabinClass;
  contactEmail: string;
  contactPhone?: string;
  passengers: PassengerInput[];
}
