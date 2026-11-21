import { HeroSection } from "@/sections/HeroSection";
import { ManageStrip } from "@/sections/ManageStrip";
import { PopularDestinations } from "@/sections/PopularDestinations";
import { FeaturedFlightDeals } from "@/sections/FeaturedFlightDeals";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { TravelInspiration } from "@/sections/TravelInspiration";
import { NewsletterSection } from "@/sections/NewsletterSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ManageStrip />
      <PopularDestinations />
      <FeaturedFlightDeals />
      <WhyChooseUs />
      <TravelInspiration />
      <NewsletterSection />
    </>
  );
}
