import { Container } from "@/components/ui/Container";
import { SpotlightBackground } from "@/components/ui/SpotlightBackground";
import { SearchForm } from "@/components/search/SearchForm";

export function HeroSection() {
  return (
    <section class="relative isolate overflow-hidden bg-navy-950">
      <SpotlightBackground />
      <Container class="py-12 sm:py-16 lg:py-20">
        <div class="max-w-2xl" style={{ textShadow: "0 2px 12px rgba(0, 0, 0, 0.7)" }}>
          <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Search flights
          </h1>
          <p class="mt-3 text-sm leading-relaxed text-white sm:text-base">
            Enter your route and dates to see available flights.
          </p>
        </div>

        <div class="mt-8">
          <SearchForm />
        </div>
      </Container>
    </section>
  );
}
