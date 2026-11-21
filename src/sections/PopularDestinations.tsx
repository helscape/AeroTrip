import { DestinationCard } from "@/components/DestinationCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { destinations } from "@/data/destinations";
import { isoDatePlus } from "@/lib/format";

export function PopularDestinations() {
  return (
    <section id="destinations" class="bg-navy-50/70 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Destinations"
          title="Where to next?"
          description="Tap a city to search live sample flights from Jakarta."
        />

        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => {
            const query = new URLSearchParams({
              origin: "CGK",
              destination: destination.code,
              departDate: isoDatePlus(14),
              passengers: "1",
              cabin: "economy",
            });
            return (
              <DestinationCard
                key={destination.id}
                destination={destination}
                href={`/search?${query.toString()}`}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
