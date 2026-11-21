import { useRoute } from "preact-iso";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const CONTENT: Record<string, { title: string; updated: string; sections: Array<[string, string]> }> = {
  terms: {
    title: "Terms of Service",
    updated: "Last updated 1 November 2026",
    sections: [
      [
        "About this demo",
        "AeroTrip is a demonstration booking application. Flight inventory is synthetic sample data, no payment is collected, and no real ticket is issued. A booking confirmation is an in-app record only.",
      ],
      [
        "Using the service",
        "You may search, book, view and cancel sample bookings for personal evaluation. Do not attempt to overload the service, scrape inventory, or interfere with other users' bookings.",
      ],
      [
        "Booking references",
        "References are generated randomly. Keep your reference and contact email safe: together they allow anyone to view or cancel that booking.",
      ],
      [
        "Availability",
        "Seats are decremented when a booking is created and restored when it is cancelled. Inventory may be reseeded at any time, which can reset seat counts and remove bookings.",
      ],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated 1 November 2026",
    sections: [
      [
        "What we store",
        "If you create an account we store your email address, name, optional phone number and a one-way password hash. Bookings store traveler names, dates of birth, optional passport numbers and contact details.",
      ],
      [
        "How data is used",
        "Data is used only to provide search, booking and account features. We do not sell data, send marketing email from this demo, or share details with third parties.",
      ],
      [
        "Passwords and tokens",
        "Passwords are hashed with bcrypt and never stored in plain text. Sign-in uses a signed bearer token held in your browser's local storage; signing out removes it.",
      ],
      [
        "Your choices",
        "Guest checkout requires no account. You can edit profile details in My Account, update booking contact details in My Trips, or contact support to discuss data removal.",
      ],
    ],
  },
  cookies: {
    title: "Cookie Settings",
    updated: "Last updated 1 November 2026",
    sections: [
      [
        "No tracking cookies",
        "AeroTrip does not use advertising, analytics or cross-site tracking cookies. There is no cookie banner because there is nothing to consent to.",
      ],
      [
        "Local storage",
        "The app stores a sign-in token and your last-used email in your browser's local storage so you stay signed in and can quickly find a confirmation. You can remove these at any time by signing out or clearing site data.",
      ],
      [
        "Third-party fonts",
        "The interface loads Plus Jakarta Sans from Google Fonts. That provider may receive standard web request data such as your IP address.",
      ],
    ],
  },
};

export function LegalPage() {
  const { params } = useRoute();
  const page = CONTENT[params.topic] ?? CONTENT.terms;

  return (
    <Container class="max-w-3xl py-10 sm:py-14">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">
        AeroTrip policies
      </p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
        {page.title}
      </h1>
      <p class="mt-2 text-xs text-navy-400">{page.updated}</p>

      <div class="mt-8 space-y-6 rounded-3xl border border-navy-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        {page.sections.map(([heading, body]) => (
          <section key={heading}>
            <h2 class="text-base font-bold text-navy-900">{heading}</h2>
            <p class="mt-2 text-sm leading-relaxed text-navy-500">{body}</p>
          </section>
        ))}
      </div>

      <Button href="/" variant="outline" class="mt-8">
        Back to AeroTrip
      </Button>
    </Container>
  );
}
