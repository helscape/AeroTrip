import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FlightDealCard } from "@/components/FlightDealCard";
import { flightDeals } from "@/data/flightDeals";

export function FeaturedFlightDeals() {
  return (
    <section id="deals" class="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Deals"
          title="Sample Fares"
          description="Example routes for illustration only. Not real schedules."
        />

        <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flightDeals.map((deal) => (
            <FlightDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </Container>
    </section>
  );
}
