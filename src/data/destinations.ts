import type { Destination } from "@/types";

/**
 * Placeholder destination content.
 * Prices are indicative dummy values, not live fares.
 */
export const destinations: Destination[] = [
  {
    id: "bali",
    city: "Bali",
    country: "Indonesia",
    description: "Rice terraces, temple sunsets, and surf-washed coastlines.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Coastal cliffs meeting turquoise water in Bali, Indonesia",
    startingPrice: 189,
    tag: "Trending",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    description: "Neon skylines, quiet shrines, and late-night ramen counters.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Tokyo street at night lit by colourful neon signs",
    startingPrice: 512,
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    description: "A garden city of hawker stalls, skyline views, and clean transit.",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Marina Bay skyline in Singapore at dusk",
    startingPrice: 240,
  },
  {
    id: "bangkok",
    city: "Bangkok",
    country: "Thailand",
    description: "Golden temples, floating markets, and street food everywhere.",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Ornate temple rooftops in Bangkok, Thailand",
    startingPrice: 176,
    tag: "Best value",
  },
  {
    id: "seoul",
    city: "Seoul",
    country: "South Korea",
    description: "Palaces, cafés, and mountains within one subway ride.",
    image:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Traditional hanok rooftops with the Seoul skyline behind",
    startingPrice: 398,
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    description: "Boulevards, museums, and long golden evenings by the river.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
    imageAlt: "The Eiffel Tower rising above Paris at golden hour",
    startingPrice: 634,
  },
];
