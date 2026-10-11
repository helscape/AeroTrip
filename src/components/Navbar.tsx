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
