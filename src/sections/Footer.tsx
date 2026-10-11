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
