import { ArrowUpRight, MapPin } from "lucide-preact";
import { Badge } from "@/components/ui/Badge";
import type { Destination } from "@/types";

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
  const { city, country, description, image, imageAlt, startingPrice, tag } =
    destination;

  return (
    <article class="group flex h-full flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white transition-shadow duration-300 hover:shadow-[var(--shadow-card)]">
      <div class="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div class="absolute inset-0 bg-navy-950/55 transition-colors duration-300 group-hover:bg-navy-950/65" />

        {tag ? (
          <Badge tone="white" class="absolute left-4 top-4">
            {tag}
          </Badge>
        ) : null}

        <div class="absolute inset-x-4 bottom-4">
          <h3 class="text-lg font-bold text-white">{city}</h3>
          <p class="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/85">
            <MapPin class="h-3.5 w-3.5" />
            {country}
          </p>
        </div>
      </div>

      <div class="flex flex-1 flex-col p-5">
        <p class="text-sm leading-relaxed text-navy-500">{description}</p>

        <div class="mt-auto flex items-end justify-between gap-4 border-t border-navy-100 pt-5">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
              Starting from
            </p>
            <p class="mt-1 text-lg font-extrabold text-navy-900">
              ${startingPrice}
              <span class="text-xs font-medium text-navy-400"> / one way</span>
            </p>
          </div>

          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-600 transition-colors duration-300 group-hover:bg-sky-500 group-hover:text-white">
            <ArrowUpRight class="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
