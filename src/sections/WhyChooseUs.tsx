import {
  CalendarRange,
  Search,
  Wallet,
  Zap,
} from "lucide-preact";
import type { ComponentChildren } from "preact";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { features } from "@/data/features";
import type { FeatureIconName } from "@/types";

const ICONS: Record<FeatureIconName, ComponentChildren> = {
  search: <Search class="h-5 w-5" />,
  wallet: <Wallet class="h-5 w-5" />,
  calendar: <CalendarRange class="h-5 w-5" />,
  zap: <Zap class="h-5 w-5" />,
};

export function WhyChooseUs() {
  return (
    <section id="about" class="bg-navy-50/70 py-20 sm:py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Why AeroTrip"
          title="Why AeroTrip"
          description="Four things we optimise for."
        />

        <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.id}
              class="group flex h-full flex-col rounded-3xl border border-navy-100 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[var(--shadow-card)]"
            >
              <span class="grid h-11 w-11 place-items-center rounded-2xl bg-navy-900 text-white transition-colors duration-300 group-hover:bg-sky-500">
                {ICONS[feature.icon]}
              </span>

              <h3 class="mt-5 text-base font-bold text-navy-900">
                {feature.title}
              </h3>

              <p class="mt-2.5 text-sm leading-relaxed text-navy-500">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
