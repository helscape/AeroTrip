/**
 * Shared domain types.
 *
 * These are intentionally shaped like the entities a future API / database
 * layer would return, so presentational components can be swapped from
 * mock data to real data without a redesign.
 */

export interface Destination {
  id: string;
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
