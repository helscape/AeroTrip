import { MainLayout } from "@/layouts/MainLayout";
import { HeroSection } from "@/sections/HeroSection";
import { PopularDestinations } from "@/sections/PopularDestinations";
import { FeaturedFlightDeals } from "@/sections/FeaturedFlightDeals";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { TravelInspiration } from "@/sections/TravelInspiration";
import { NewsletterSection } from "@/sections/NewsletterSection";

export function App() {
  return (
    <MainLayout>
      <HeroSection />
      <PopularDestinations />
      <FeaturedFlightDeals />
      <WhyChooseUs />
      <TravelInspiration />
      <NewsletterSection />
    </MainLayout>
  );
}
