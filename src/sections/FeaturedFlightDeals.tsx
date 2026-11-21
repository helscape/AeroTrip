import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FlightDealCard } from "@/components/FlightDealCard";
import { flightDeals } from "@/data/flightDeals";
import { isoDatePlus } from "@/lib/format";

export function FeaturedFlightDeals() {
  return (
    <section id="deals" class="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Deals"
          title="Routes travelers love"
          description="These example itineraries open a live search with the route pre-filled."
        />

        <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flightDeals.map((deal) => {
            const query = new URLSearchParams({
              origin: deal.from.code,
              destination: deal.to.code,
              departDate: isoDatePlus(14),
              passengers: "1",
              cabin: "economy",
            });
            if (deal.tripType === "Round trip") {
              query.set("returnDate", isoDatePlus(21));
            }
            return (
              <FlightDealCard
                key={deal.id}
                deal={deal}
                href={`/search?${query.toString()}`}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
