import { DestinationCard } from "@/components/DestinationCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { destinations } from "@/data/destinations";

export function PopularDestinations() {
  return (
    <section id="destinations" class="bg-navy-50/70 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Destinations"
          title="Popular Destinations"
          description="A few cities travellers keep coming back to."
        />

        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </Container>
    </section>
  );
}
