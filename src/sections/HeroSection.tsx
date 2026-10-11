import { Container } from "@/components/ui/Container";
import { FlightSearchCard } from "@/sections/FlightSearchCard";

export function HeroSection() {
  return (
    <section class="border-b border-navy-100 bg-white pb-14 pt-10 sm:pt-12 lg:pb-20 lg:pt-14">
      <Container>
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-3xl font-extrabold leading-tight tracking-tight text-navy-900 text-balance sm:text-4xl lg:text-[2.75rem]">
            Search, compare, and book flights.
          </h1>
          <p class="mt-3 text-sm leading-relaxed text-navy-500 sm:text-base">
            One clean place to find the right flight. No ads, no upsells.
          </p>
        </div>

        <div class="mt-8 sm:mt-10">
          <FlightSearchCard />
        </div>

        <p class="mt-4 text-center text-[11px] text-navy-400">
          Sample fares for illustration only — no live availability in this
          preview.
        </p>
      </Container>
    </section>
  );
}
