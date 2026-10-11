import type { FooterColumn, SocialLink } from "@/types";

export const footerColumns: FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "Flights", href: "#flights" },
      { label: "Destinations", href: "#destinations" },
      { label: "Deals", href: "#deals" },
      { label: "Travel Guides", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Cancellation Options", href: "#" },
      { label: "Baggage Info", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: "AeroTrip on Facebook", href: "#" },
  { label: "AeroTrip on Instagram", href: "#" },
  { label: "AeroTrip on LinkedIn", href: "#" },
  { label: "AeroTrip on YouTube", href: "#" },
];
