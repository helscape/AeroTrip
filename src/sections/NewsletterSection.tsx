import { Mail } from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function NewsletterSection() {
  return (
    <section class="bg-white pb-20 sm:pb-24">
      <Container>
        <div class="rounded-[2rem] bg-navy-900 px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-400">
                Newsletter
              </p>

              <h2 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-4xl">
                Fares and routes, once a week.
              </h2>

              <p class="mt-4 max-w-lg text-sm leading-relaxed text-navy-200 sm:text-base">
                Destination guides and seasonal fare trends. No spam, no
                daily blasts.
              </p>
            </div>

            <div>
              {/* Visual-only email field + button (no submission) */}
              <div class="flex flex-col gap-3 sm:flex-row">
                <div class="flex h-12 flex-1 items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5">
                  <Mail class="h-4 w-4 shrink-0 text-white/50" />
                  <span class="truncate text-sm text-white/50">
                    you@example.com
                  </span>
                </div>

                <Button variant="secondary" size="lg" class="h-12 shrink-0">
                  Subscribe
                </Button>
              </div>

              <p class="mt-4 text-xs text-navy-300">Unsubscribe any time.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
