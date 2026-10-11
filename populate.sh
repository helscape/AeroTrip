#!/usr/bin/env bash
set -e

# ============================================================
# AeroTrip — Flight Booking Landing Page
# One-shot setup script (Bun + Preact + TypeScript + Tailwind v4)
# ============================================================

PROJECT_NAME="aerotrip"

echo "▸ Creating project directory: $PROJECT_NAME"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# ------------------------------------------------------------
# 1. Initialize Bun project
# ------------------------------------------------------------
echo "▸ Initializing Bun project"
bun init -y > /dev/null

# ------------------------------------------------------------
# 2. Install dependencies
# ------------------------------------------------------------
echo "▸ Installing dependencies"
bun add preact lucide-preact
bun add -d vite @preact/preset-vite tailwindcss @tailwindcss/vite typescript @types/node

# ------------------------------------------------------------
# 3. Create directory structure
# ------------------------------------------------------------
echo "▸ Creating directories"
mkdir -p src/components/ui
mkdir -p src/sections
mkdir -p src/layouts
mkdir -p src/data
mkdir -p src/types
mkdir -p src/styles
mkdir -p public

# ------------------------------------------------------------
# 4. Write configuration files
# ------------------------------------------------------------
echo "▸ Writing configuration files"

cat > package.json << 'EOF'
{
  "name": "aerotrip",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "description": "AeroTrip — modern flight booking landing page (visual scaffolding only).",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "lucide-preact": "^0.400.0",
    "preact": "^10.24.0"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.9.0",
    "@tailwindcss/vite": "^4.0.0",
    "@types/node": "^22.10.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
EOF

cat > vite.config.ts << 'EOF'
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
EOF

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
EOF

cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>AeroTrip — Explore the World, One Flight at a Time</title>
    <meta
      name="description"
      content="AeroTrip is a modern flight booking experience. Search routes, compare fares, and plan your next journey — all in one clean, calm place."
    />
    <meta name="theme-color" content="#0f1c3f" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > public/favicon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0f1c3f"/>
  <path d="M16 7.5l8 8.5-8 4.2-8-4.2 8-8.5z" fill="#ffffff"/>
</svg>
EOF

# ------------------------------------------------------------
# 5. Write styles
# ------------------------------------------------------------
echo "▸ Writing styles"

cat > src/styles/index.css << 'EOF'
@import "tailwindcss";

/* ------------------------------------------------------------------
   Design tokens
   ------------------------------------------------------------------ */
@theme {
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system,
    "Segoe UI", Roboto, sans-serif;

  /* Primary — deep navy / royal blue */
  --color-navy-50: #f4f6fc;
  --color-navy-100: #e6ebf7;
  --color-navy-200: #c9d5ec;
  --color-navy-300: #9db1da;
  --color-navy-400: #6d88c4;
  --color-navy-500: #4c69ad;
  --color-navy-600: #3a5292;
  --color-navy-700: #304276;
  --color-navy-800: #1d2b52;
  --color-navy-900: #0f1c3f;
  --color-navy-950: #070f26;

  --shadow-card: 0 20px 50px -24px rgba(15, 28, 63, 0.35);
  --shadow-float: 0 28px 70px -28px rgba(15, 28, 63, 0.45);
}

/* ------------------------------------------------------------------
   Base
   ------------------------------------------------------------------ */
html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
  scroll-padding-top: 5rem;
}

body {
  background-color: #ffffff;
  color: var(--color-navy-700);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background-color: #bae6fd;
  color: var(--color-navy-900);
}

img {
  max-width: 100%;
  height: auto;
}
EOF

# ------------------------------------------------------------
# 6. Write types
# ------------------------------------------------------------
echo "▸ Writing types"

cat > src/types/index.ts << 'EOF'
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
EOF

# ------------------------------------------------------------
# 7. Write data
# ------------------------------------------------------------
echo "▸ Writing data"

cat > src/data/navigation.ts << 'EOF'
import type { NavLink } from "@/types";

export const navLinks: NavLink[] = [
  { label: "Flights", href: "#flights" },
  { label: "Destinations", href: "#destinations" },
  { label: "Deals", href: "#deals" },
  { label: "About Us", href: "#about" },
];
EOF

cat > src/data/destinations.ts << 'EOF'
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
EOF

cat > src/data/flightDeals.ts << 'EOF'
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
EOF

cat > src/data/features.ts << 'EOF'
import type { Feature } from "@/types";

export const features: Feature[] = [
  {
    id: "easy-flight-search",
    icon: "search",
    title: "Easy Flight Search",
    description:
      "Compare routes, schedules, and carriers across hundreds of airlines in one clean search.",
  },
  {
    id: "transparent-pricing",
    icon: "wallet",
    title: "Transparent Pricing",
    description:
      "See the full fare breakdown up front — no hidden fees and no surprises at checkout.",
  },
  {
    id: "flexible-travel-options",
    icon: "calendar",
    title: "Flexible Travel Options",
    description:
      "Filter by date, cabin class, and stopovers to shape the itinerary that fits your plans.",
  },
  {
    id: "seamless-booking",
    icon: "zap",
    title: "Seamless Booking Experience",
    description:
      "A guided, three-step flow designed to get you from first search to confirmed seat in minutes.",
  },
];
EOF

cat > src/data/inspirations.ts << 'EOF'
import type { Inspiration } from "@/types";

export const inspirations: Inspiration[] = [
  {
    id: "weekend-escapes",
    title: "Weekend Escapes",
    description:
      "Short-haul trips that fit neatly between Friday night and Monday morning.",
    meta: "12 guides",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Still mountain lake reflecting peaks at sunrise",
  },
  {
    id: "tropical-adventures",
    title: "Tropical Adventures",
    description: "Warm water, slow mornings, and islands worth losing track of time on.",
    meta: "9 guides",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Palm trees leaning over a white sand beach and clear water",
  },
  {
    id: "asian-cities",
    title: "Explore Asian Cities",
    description: "Street food, night markets, and skylines that never really sleep.",
    meta: "15 guides",
    image:
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Dense city street in Asia glowing with signs after dark",
  },
];
EOF

cat > src/data/footer.ts << 'EOF'
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
EOF

# ------------------------------------------------------------
# 8. Write UI primitives
# ------------------------------------------------------------
echo "▸ Writing UI primitives"

cat > src/components/ui/Container.tsx << 'EOF'
import type { ComponentChildren } from "preact";

interface ContainerProps {
  children: ComponentChildren;
  class?: string;
}

/** Consistent horizontal rhythm + max width across every section. */
export function Container({ children, class: className = "" }: ContainerProps) {
  return (
    <div class={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
EOF

cat > src/components/ui/Button.tsx << 'EOF'
import type { ComponentChildren } from "preact";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "light";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-800",
  secondary: "bg-sky-500 text-white hover:bg-sky-600",
  outline:
    "border border-navy-200 bg-white text-navy-900 hover:border-navy-300 hover:bg-navy-50",
  ghost: "text-navy-600 hover:bg-navy-50 hover:text-navy-900",
  light: "bg-white text-navy-900 hover:bg-navy-50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm sm:text-base",
};

interface ButtonProps {
  children: ComponentChildren;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When provided the button renders as an anchor. */
  href?: string;
  class?: string;
  "aria-label"?: string;
}

/**
 * Presentational button. Renders an <a> when `href` is set, otherwise a
 * <button type="button">. No click handlers by design — this is UI only.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  class: className = "",
  ...rest
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href) {
    return (
      <a href={href} class={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" class={classes} {...rest}>
      {children}
    </button>
  );
}
EOF

cat > src/components/ui/Badge.tsx << 'EOF'
import type { ComponentChildren } from "preact";

export type BadgeTone = "sky" | "navy" | "emerald" | "amber" | "white";

const TONES: Record<BadgeTone, string> = {
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  navy: "bg-navy-50 text-navy-700 ring-navy-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  white: "bg-white/90 text-navy-800 ring-white/70 backdrop-blur-sm",
};

interface BadgeProps {
  children: ComponentChildren;
  tone?: BadgeTone;
  class?: string;
}

export function Badge({ children, tone = "navy", class: className = "" }: BadgeProps) {
  return (
    <span
      class={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
EOF

cat > src/components/ui/SectionHeading.tsx << 'EOF'
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  class?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  class: className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";

  return (
    <div class={`${alignment} ${className}`}>
      {eyebrow ? (
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">
          {eyebrow}
        </p>
      ) : null}

      <h2 class="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-navy-900 text-balance sm:text-4xl">
        {title}
      </h2>

      {description ? (
        <p class="mt-4 text-base leading-relaxed text-navy-500">{description}</p>
      ) : null}
    </div>
  );
}
EOF

cat > src/components/ui/FieldVisual.tsx << 'EOF'
import type { ComponentChildren } from "preact";

interface FieldVisualProps {
  /** Rendered Lucide icon element. */
  icon: ComponentChildren;
  label: string;
  value: string;
  hint?: string;
  class?: string;
}

/**
 * Static representation of a search form field.
 * Deliberately not an <input> — there is no form logic in this build.
 */
export function FieldVisual({
  icon,
  label,
  value,
  hint,
  class: className = "",
}: FieldVisualProps) {
  return (
    <div
      class={`group flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 transition-colors duration-200 hover:border-sky-300 hover:bg-sky-50/40 ${className}`}
    >
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-500 transition-colors duration-200 group-hover:bg-sky-100 group-hover:text-sky-600">
        {icon}
      </span>

      <span class="min-w-0 flex-1">
        <span class="block text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
          {label}
        </span>
        <span class="mt-0.5 block truncate text-sm font-semibold text-navy-900">
          {value}
        </span>
        {hint ? (
          <span class="mt-0.5 block truncate text-xs text-navy-400">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 9. Write components
# ------------------------------------------------------------
echo "▸ Writing components"

cat > src/components/Navbar.tsx << 'EOF'
import { Menu, Plane } from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/data/navigation";

export function Navbar() {
  return (
    <header class="sticky top-0 z-50 border-b border-navy-100/80 bg-white/85 backdrop-blur-lg">
      <Container>
        <nav
          class="flex h-16 items-center justify-between gap-4 lg:h-20"
          aria-label="Main navigation"
        >
          {/* Brand */}
          <a href="#" class="flex items-center gap-2.5" aria-label="AeroTrip home">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-sm">
              <Plane class="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span class="text-lg font-extrabold tracking-tight text-navy-900">
              AeroTrip
            </span>
          </a>

          {/* Desktop links */}
          <ul class="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  class="text-sm font-medium text-navy-600 transition-colors duration-200 hover:text-navy-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div class="flex items-center gap-2">
            <a
              href="#"
              class="hidden rounded-full px-4 py-2 text-sm font-semibold text-navy-700 transition-colors duration-200 hover:bg-navy-50 hover:text-navy-900 sm:inline-flex"
            >
              Sign In
            </a>

            <Button href="#" size="sm" class="hidden sm:inline-flex">
              Get Started
            </Button>

            {/* Mobile navigation visual (static) */}
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-xl border border-navy-100 text-navy-700 transition-colors duration-200 hover:bg-navy-50 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu class="h-5 w-5" />
            </button>
          </div>
        </nav>
      </Container>
    </header>
  );
}
EOF

cat > src/components/DestinationCard.tsx << 'EOF'
import { ArrowUpRight, MapPin } from "lucide-preact";
import { Badge } from "@/components/ui/Badge";
import type { Destination } from "@/types";

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
  const { city, country, description, image, imageAlt, startingPrice, tag } =
    destination;

  return (
    <article class="group flex h-full flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white transition-shadow duration-300 hover:shadow-[var(--shadow-card)]">
      <div class="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/10 to-transparent" />

        {tag ? (
          <Badge tone="white" class="absolute left-4 top-4">
            {tag}
          </Badge>
        ) : null}

        <div class="absolute inset-x-4 bottom-4">
          <h3 class="text-lg font-bold text-white">{city}</h3>
          <p class="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/85">
            <MapPin class="h-3.5 w-3.5" />
            {country}
          </p>
        </div>
      </div>

      <div class="flex flex-1 flex-col p-5">
        <p class="text-sm leading-relaxed text-navy-500">{description}</p>

        <div class="mt-auto flex items-end justify-between gap-4 border-t border-navy-100 pt-5">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
              Starting from
            </p>
            <p class="mt-1 text-lg font-extrabold text-navy-900">
              ${startingPrice}
              <span class="text-xs font-medium text-navy-400"> / one way</span>
            </p>
          </div>

          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-600 transition-colors duration-300 group-hover:bg-sky-500 group-hover:text-white">
            <ArrowUpRight class="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
EOF

cat > src/components/FlightDealCard.tsx << 'EOF'
import { ArrowRight, Clock, PlaneTakeoff, Repeat } from "lucide-preact";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { FlightDeal } from "@/types";

interface FlightDealCardProps {
  deal: FlightDeal;
}

export function FlightDealCard({ deal }: FlightDealCardProps) {
  const {
    airline,
    airlineCode,
    from,
    to,
    departureTime,
    arrivalTime,
    duration,
    stops,
    tripType,
    price,
    badge,
  } = deal;

  return (
    <article class="group flex h-full flex-col rounded-3xl border border-navy-100 bg-white p-5 transition-shadow duration-300 hover:shadow-[var(--shadow-card)] sm:p-6">
      {/* Airline */}
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          {/* Logo placeholder */}
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-[11px] font-extrabold tracking-wide text-white">
            {airlineCode}
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-navy-900">{airline}</p>
            <p class="text-xs text-navy-400">Sample itinerary</p>
          </div>
        </div>

        {badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null}
      </div>

      {/* Route */}
      <div class="mt-6 flex items-center gap-3">
        <div class="shrink-0">
          <p class="text-xl font-extrabold tracking-tight text-navy-900">
            {from.code}
          </p>
          <p class="text-xs text-navy-400">{departureTime}</p>
        </div>

        <div class="flex flex-1 flex-col items-center">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-navy-400">
            {duration}
          </span>
          <span class="mt-1 flex w-full items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-navy-200" />
            <span class="h-px flex-1 bg-navy-200" />
            <PlaneTakeoff class="h-3.5 w-3.5 rotate-45 text-sky-500" />
            <span class="h-px flex-1 bg-navy-200" />
            <span class="h-1.5 w-1.5 rounded-full bg-navy-200" />
          </span>
          <span class="mt-1 text-[10px] font-semibold text-sky-600">{stops}</span>
        </div>

        <div class="shrink-0 text-right">
          <p class="text-xl font-extrabold tracking-tight text-navy-900">
            {to.code}
          </p>
          <p class="text-xs text-navy-400">{arrivalTime}</p>
        </div>
      </div>

      <p class="mt-3 text-center text-[11px] text-navy-400">
        {from.city} → {to.city}
      </p>

      {/* Meta */}
      <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-navy-100 pt-5 text-xs font-medium text-navy-500">
        <span class="inline-flex items-center gap-1.5">
          <Clock class="h-3.5 w-3.5 text-navy-300" />
          {duration}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <Repeat class="h-3.5 w-3.5 text-navy-300" />
          {tripType}
        </span>
      </div>

      {/* Price + CTA */}
      <div class="mt-5 flex items-end justify-between gap-4 border-t border-navy-100 pt-5">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
            From
          </p>
          <p class="mt-1 text-2xl font-extrabold tracking-tight text-navy-900">
            ${price}
          </p>
        </div>

        <Button variant="outline" size="sm" href="#" class="group-hover:border-navy-300">
          View Deal
          <ArrowRight class="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}
EOF

# ------------------------------------------------------------
# 10. Write layouts
# ------------------------------------------------------------
echo "▸ Writing layouts"

cat > src/layouts/MainLayout.tsx << 'EOF'
import type { ComponentChildren } from "preact";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/sections/Footer";

interface MainLayoutProps {
  children: ComponentChildren;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div class="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <Navbar />
      <main class="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
EOF

# ------------------------------------------------------------
# 11. Write sections
# ------------------------------------------------------------
echo "▸ Writing sections"

cat > src/sections/FlightSearchCard.tsx << 'EOF'
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
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <p class="hidden text-xs font-medium text-navy-400 sm:block">
          Indicative fares include taxes &amp; fees
        </p>
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
EOF

cat > src/sections/HeroSection.tsx << 'EOF'
import { ArrowRight, Check, Plane } from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FlightSearchCard } from "@/sections/FlightSearchCard";

const trustPoints = [
  "Free cancellation options",
  "No hidden booking fees",
  "Flexible date changes",
];

export function HeroSection() {
  return (
    <section class="relative overflow-hidden bg-gradient-to-b from-navy-50 via-white to-white pb-20 pt-14 sm:pt-16 lg:pb-24 lg:pt-20">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div class="absolute -left-32 -top-24 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl" />
        <div class="absolute -right-24 top-32 h-96 w-96 rounded-full bg-navy-200/35 blur-3xl" />
      </div>

      <Container class="relative">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div>
            <p class="inline-flex items-center gap-2 rounded-full border border-navy-100 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-navy-500 backdrop-blur-sm">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Your next journey starts here
            </p>

            <h1 class="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 text-balance sm:text-5xl lg:text-[3.5rem]">
              Explore the World, One Flight at a Time.
            </h1>

            <p class="mt-6 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
              Compare routes across hundreds of airlines, see the full fare up
              front, and plan your next trip in minutes — all from one calm,
              clutter-free place.
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="#flights" size="lg" class="w-full sm:w-auto">
                Explore Flights
                <ArrowRight class="h-4 w-4" />
              </Button>

              <Button
                href="#destinations"
                variant="outline"
                size="lg"
                class="w-full sm:w-auto"
              >
                Discover Destinations
              </Button>
            </div>

            <ul class="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map((point) => (
                <li
                  key={point}
                  class="flex items-center gap-2 text-sm font-medium text-navy-500"
                >
                  <span class="grid h-5 w-5 place-items-center rounded-full bg-sky-100 text-sky-600">
                    <Check class="h-3 w-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div class="relative">
            <div class="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/60 shadow-[var(--shadow-float)] sm:aspect-[5/4] lg:aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80"
                alt="View from an aircraft window above a sea of clouds at sunset"
                class="h-full w-full object-cover"
                decoding="async"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent" />
            </div>

            {/* Floating: live fares */}
            <div class="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-navy-800 shadow-lg backdrop-blur-sm sm:right-6 sm:top-6">
              <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live fares updating
            </div>

            {/* Floating: mini itinerary */}
            <div class="absolute -bottom-5 left-4 w-[15rem] rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-[var(--shadow-card)] backdrop-blur-sm sm:left-6 sm:w-[16.5rem]">
              <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
                <Plane class="h-3.5 w-3.5 text-sky-500" />
                Popular route
              </div>

              <div class="mt-2.5 flex items-center justify-between">
                <div>
                  <p class="text-sm font-extrabold text-navy-900">CGK</p>
                  <p class="text-[11px] text-navy-400">Jakarta</p>
                </div>

                <div class="flex flex-1 items-center gap-1.5 px-3">
                  <span class="h-1.5 w-1.5 rounded-full bg-navy-200" />
                  <span class="h-px flex-1 bg-navy-200" />
                  <span class="h-1.5 w-1.5 rounded-full bg-navy-200" />
                </div>

                <div class="text-right">
                  <p class="text-sm font-extrabold text-navy-900">DPS</p>
                  <p class="text-[11px] text-navy-400">Denpasar</p>
                </div>
              </div>

              <p class="mt-3 border-t border-navy-100 pt-3 text-[11px] font-medium text-navy-400">
                Direct · 1h 55m · from{" "}
                <span class="font-bold text-navy-800">$189</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search card */}
        <div class="mt-16 lg:mt-20">
          <FlightSearchCard />
        </div>
      </Container>
    </section>
  );
}
EOF

cat > src/sections/PopularDestinations.tsx << 'EOF'
import { ArrowRight } from "lucide-preact";
import { DestinationCard } from "@/components/DestinationCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { destinations } from "@/data/destinations";

export function PopularDestinations() {
  return (
    <section id="destinations" class="bg-navy-50/70 py-20 sm:py-24">
      <Container>
        <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Popular destinations"
            title="Find Your Next Destination"
            description="Handpicked cities our travellers keep coming back to. Browse the highlights and start shaping your trip."
          />

          <a
            href="#deals"
            class="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy-700 transition-colors duration-200 hover:text-sky-600"
          >
            View all destinations
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>

        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </Container>
    </section>
  );
}
EOF

cat > src/sections/FeaturedFlightDeals.tsx << 'EOF'
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FlightDealCard } from "@/components/FlightDealCard";
import { flightDeals } from "@/data/flightDeals";

export function FeaturedFlightDeals() {
  return (
    <section id="deals" class="bg-white py-20 sm:py-24">
      <Container>
        <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Featured deals"
            title="Fares Worth Booking Early"
            description="A snapshot of the routes travellers are watching this month. Compare, shortlist, and pick the one that fits."
          />
        </div>

        <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flightDeals.map((deal) => (
            <FlightDealCard key={deal.id} deal={deal} />
          ))}
        </div>

        <p class="mt-8 text-center text-xs text-navy-400">
          Sample itineraries and indicative prices shown for illustration only —
          not live availability.
        </p>
      </Container>
    </section>
  );
}
EOF

cat > src/sections/WhyChooseUs.tsx << 'EOF'
import {
  CalendarRange,
  Search,
  Wallet,
  Zap,
} from "lucide-preact";
import type { ComponentChildren } from "preact";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { features } from "@/data/features";
import type { FeatureIconName } from "@/types";

const ICONS: Record<FeatureIconName, ComponentChildren> = {
  search: <Search class="h-5 w-5" />,
  wallet: <Wallet class="h-5 w-5" />,
  calendar: <CalendarRange class="h-5 w-5" />,
  zap: <Zap class="h-5 w-5" />,
};

export function WhyChooseUs() {
  return (
    <section id="about" class="bg-navy-50/70 py-20 sm:py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Why AeroTrip"
          title="Built Around How People Actually Travel"
          description="Every part of the experience is designed to remove friction — from the first search to the moment you board."
        />

        <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.id}
              class="group flex h-full flex-col rounded-3xl border border-navy-100 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[var(--shadow-card)]"
            >
              <span class="grid h-11 w-11 place-items-center rounded-2xl bg-navy-900 text-white transition-colors duration-300 group-hover:bg-sky-500">
                {ICONS[feature.icon]}
              </span>

              <h3 class="mt-5 text-base font-bold text-navy-900">
                {feature.title}
              </h3>

              <p class="mt-2.5 text-sm leading-relaxed text-navy-500">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
EOF

cat > src/sections/TravelInspiration.tsx << 'EOF'
import { ArrowRight } from "lucide-preact";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { inspirations } from "@/data/inspirations";

export function TravelInspiration() {
  return (
    <section class="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Travel inspiration"
          title="Not Sure Where to Go Next?"
          description="Start from a mood rather than a map. These collections are a good place to begin."
        />

        <div class="mt-12 grid gap-5 lg:grid-cols-2 lg:grid-rows-2">
          {inspirations.map((item, index) => {
            const isFeature = index === 0;

            return (
              <article
                key={item.id}
                class={`group relative overflow-hidden rounded-3xl border border-navy-100 ${
                  isFeature
                    ? "min-h-[20rem] lg:row-span-2 lg:min-h-[33rem]"
                    : "min-h-[15rem] lg:min-h-[16rem]"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  loading="lazy"
                  decoding="async"
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/35 to-transparent" />

                <div class="relative flex h-full flex-col justify-end p-6 sm:p-7">
                  <span class="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                    {item.meta}
                  </span>

                  <h3
                    class={`mt-4 font-extrabold tracking-tight text-white text-balance ${
                      isFeature ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p class="mt-2.5 max-w-md text-sm leading-relaxed text-white/80">
                    {item.description}
                  </p>

                  <span class="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white">
                    Read the guide
                    <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
EOF

cat > src/sections/NewsletterSection.tsx << 'EOF'
import { Mail } from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function NewsletterSection() {
  return (
    <section class="bg-white pb-20 sm:pb-24">
      <Container>
        <div class="relative overflow-hidden rounded-[2rem] bg-navy-900 px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div class="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
            <div class="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
          </div>

          <div class="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-400">
                Newsletter
              </p>

              <h2 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-4xl">
                Your Next Adventure Starts Here.
              </h2>

              <p class="mt-4 max-w-lg text-sm leading-relaxed text-navy-200 sm:text-base">
                Get route inspiration, seasonal fare trends, and destination
                guides delivered occasionally — never more than once a week.
              </p>
            </div>

            <div>
              {/* Visual-only email field + button (no submission) */}
              <div class="flex flex-col gap-3 sm:flex-row">
                <div class="flex h-12 flex-1 items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 backdrop-blur-sm">
                  <Mail class="h-4 w-4 shrink-0 text-white/50" />
                  <span class="truncate text-sm text-white/50">
                    you@example.com
                  </span>
                </div>

                <Button variant="secondary" size="lg" class="h-12 shrink-0">
                  Subscribe
                </Button>
              </div>

              <p class="mt-4 text-xs text-navy-300">
                By subscribing you agree to our Privacy Policy. Unsubscribe at
                any time.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
EOF

cat > src/sections/Footer.tsx << 'EOF'
import {
  Facebook,
  Instagram,
  Linkedin,
  Plane,
  Youtube,
} from "lucide-preact";
import { Container } from "@/components/ui/Container";
import { footerColumns, socialLinks } from "@/data/footer";

const SOCIAL_ICONS = [
  <Facebook class="h-4 w-4" />,
  <Instagram class="h-4 w-4" />,
  <Linkedin class="h-4 w-4" />,
  <Youtube class="h-4 w-4" />,
];

export function Footer() {
  return (
    <footer class="border-t border-navy-100 bg-white">
      <Container>
        <div class="grid gap-12 py-14 lg:grid-cols-12 lg:gap-8 lg:py-16">
          {/* Brand */}
          <div class="lg:col-span-4">
            <a href="#" class="flex items-center gap-2.5" aria-label="AeroTrip home">
              <span class="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white">
                <Plane class="h-4 w-4" strokeWidth={2.4} />
              </span>
              <span class="text-lg font-extrabold tracking-tight text-navy-900">
                AeroTrip
              </span>
            </a>

            <p class="mt-5 max-w-xs text-sm leading-relaxed text-navy-500">
              A cleaner way to search, compare, and book flights — built for
              people who would rather be travelling than comparing tabs.
            </p>

            <ul class="mt-6 flex items-center gap-2.5">
              {socialLinks.map((social, index) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    class="grid h-9 w-9 place-items-center rounded-xl border border-navy-100 text-navy-500 transition-colors duration-200 hover:border-navy-200 hover:bg-navy-50 hover:text-navy-900"
                  >
                    {SOCIAL_ICONS[index]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div class="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 class="text-xs font-bold uppercase tracking-[0.14em] text-navy-900">
                  {column.title}
                </h3>

                <ul class="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        class="text-sm text-navy-500 transition-colors duration-200 hover:text-navy-900"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div class="flex flex-col gap-4 border-t border-navy-100 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs text-navy-400">
            © 2026 AeroTrip. All rights reserved.
          </p>

          <ul class="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <a
                href="#"
                class="text-xs text-navy-400 transition-colors duration-200 hover:text-navy-700"
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-navy-400 transition-colors duration-200 hover:text-navy-700"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-navy-400 transition-colors duration-200 hover:text-navy-700"
              >
                Cookie Settings
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
EOF

# ------------------------------------------------------------
# 12. Write entry points
# ------------------------------------------------------------
echo "▸ Writing entry points"

cat > src/main.tsx << 'EOF'
import { render } from "preact";
import { App } from "@/app";
import "@/styles/index.css";

const root = document.getElementById("app");

if (root) {
  render(<App />, root);
}
EOF

cat > src/app.tsx << 'EOF'
import { MainLayout } from "@/layouts/MainLayout";
import { HeroSection } from "@/sections/HeroSection";
import { PopularDestinations } from "@/sections/PopularDestinations";
import { FeaturedFlightDeals } from "@/sections/FeaturedFlightDeals";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { TravelInspiration } from "@/sections/TravelInspiration";
import { NewsletterSection } from "@/sections/NewsletterSection";

export function App() {
  return (
    <MainLayout>
      <HeroSection />
      <PopularDestinations />
      <FeaturedFlightDeals />
      <WhyChooseUs />
      <TravelInspiration />
      <NewsletterSection />
    </MainLayout>
  );
}
EOF

# ------------------------------------------------------------
# 13. Write README
# ------------------------------------------------------------
echo "▸ Writing README"

cat > README.md << 'EOF'
# AeroTrip — Flight Booking Landing Page

A modern, premium landing page for a flight booking platform. Built as a
**visual scaffolding / frontend foundation** — the UI is complete, but there is
deliberately **no business logic, no API calls, no state, and no form handling**.

---

## Tech Stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Runtime / PM   | **Bun**                         |
| Framework      | **Preact**                      |
| Language       | **TypeScript** (strict)         |
| Styling        | **Tailwind CSS v4**             |
| Build tool     | **Vite** + `@preact/preset-vite`|
| Icons          | **Lucide** (`lucide-preact`)    |
| Font           | **Plus Jakarta Sans**           |

---

## Getting Started

```bash
# 1. Install dependencies
bun install

# 2. Start the dev server
bun run dev

# 3. Production build
bun run build

# 4. Preview the production build
bun run preview
