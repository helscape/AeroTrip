import type { Destination } from "@/types";

/**
 * Placeholder destination content.
 * Prices are indicative dummy values, not live fares.
 */
export const destinations: Destination[] = [
  {
    id: "bali",
    code: "DPS",
    city: "Bali",
    country: "Indonesia",
    description: "Rice terraces, temple sunsets, and surf-washed coastlines.",
    image:
      "/images/dest-bali.jpg",
    imageAlt: "Coastal cliffs meeting turquoise water in Bali, Indonesia",
    startingPrice: 189,
    tag: "Trending",
  },
  {
    id: "tokyo",
    code: "NRT",
    city: "Tokyo",
    country: "Japan",
    description: "Neon skylines, quiet shrines, and late-night ramen counters.",
    image:
      "/images/dest-tokyo.jpg",
    imageAlt: "Tokyo street at night lit by colourful neon signs",
    startingPrice: 512,
  },
  {
    id: "singapore",
    code: "SIN",
    city: "Singapore",
    country: "Singapore",
    description: "A garden city of hawker stalls, skyline views, and clean transit.",
    image:
      "/images/dest-singapore.jpg",
    imageAlt: "Marina Bay skyline in Singapore at dusk",
    startingPrice: 240,
  },
  {
    id: "bangkok",
    code: "BKK",
    city: "Bangkok",
    country: "Thailand",
    description: "Golden temples, floating markets, and street food everywhere.",
    image:
      "/images/dest-bangkok.jpg",
    imageAlt: "Ornate temple rooftops in Bangkok, Thailand",
    startingPrice: 176,
    tag: "Best value",
  },
  {
    id: "seoul",
    code: "ICN",
    city: "Seoul",
    country: "South Korea",
    description: "Palaces, cafés, and mountains within one subway ride.",
    image:
      "/images/dest-seoul.jpg",
    imageAlt: "Traditional hanok rooftops with the Seoul skyline behind",
    startingPrice: 398,
  },
  {
    id: "paris",
    code: "CDG",
    city: "Paris",
    country: "France",
    description: "Boulevards, museums, and long golden evenings by the river.",
    image:
      "/images/dest-paris.jpg",
    imageAlt: "The Eiffel Tower rising above Paris at golden hour",
    startingPrice: 634,
  },
];
