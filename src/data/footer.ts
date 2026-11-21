import type { FooterColumn, SocialLink } from "@/types";

export const footerColumns: FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "Flights", href: "/#flights" },
      { label: "Destinations", href: "/#destinations" },
      { label: "Deals", href: "/#deals" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "My Trips", href: "/manage" },
      { label: "Manage Booking", href: "/manage" },
      { label: "Cancellation Options", href: "/help" },
      { label: "Contact Us", href: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "My Account", href: "/account" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: "AeroTrip on Facebook", href: "https://facebook.com" },
  { label: "AeroTrip on Instagram", href: "https://instagram.com" },
  { label: "AeroTrip on LinkedIn", href: "https://linkedin.com" },
  { label: "AeroTrip on YouTube", href: "https://youtube.com" },
];
