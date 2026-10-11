import { ArrowRight } from "lucide-preact";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { inspirations } from "@/data/inspirations";

export function TravelInspiration() {
  return (
    <section class="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Travel inspiration"
          title="Not Sure Where to Go Next?"
          description="Start from a mood rather than a map. These collections are a good place to begin."
        />

        <div class="mt-12 grid gap-5 lg:grid-cols-2 lg:grid-rows-2">
          {inspirations.map((item, index) => {
            const isFeature = index === 0;

            return (
              <article
                key={item.id}
                class={`group relative overflow-hidden rounded-3xl border border-navy-100 ${
                  isFeature
                    ? "min-h-[20rem] lg:row-span-2 lg:min-h-[33rem]"
                    : "min-h-[15rem] lg:min-h-[16rem]"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  loading="lazy"
                  decoding="async"
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div class="absolute inset-0 bg-navy-950/70 transition-colors duration-300 group-hover:bg-navy-950/80" />

                <div class="relative flex h-full flex-col justify-end p-6 sm:p-7">
                  <span class="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                    {item.meta}
                  </span>

                  <h3
                    class={`mt-4 font-extrabold tracking-tight text-white text-balance ${
                      isFeature ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p class="mt-2.5 max-w-md text-sm leading-relaxed text-white/80">
                    {item.description}
                  </p>

                  <span class="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white">
                    Read the guide
                    <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
