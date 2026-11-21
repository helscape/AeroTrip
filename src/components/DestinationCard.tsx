import { ArrowUpRight, MapPin } from "lucide-preact";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/components/ui/Link";
import type { Destination } from "@/types";

interface DestinationCardProps {
  destination: Destination;
  href: string;
}

export function DestinationCard({ destination, href }: DestinationCardProps) {
  const { city, country, description, image, imageAlt, startingPrice, tag } =
    destination;

  return (
    <Link href={href} class="group block h-full rounded-3xl">
      <article class="flex h-full flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-[var(--shadow-float)]">
        <div class="relative h-56 overflow-hidden sm:h-64">
          <img
            src={image}
            alt={imageAlt}
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {tag ? (
            <Badge tone="white" class="absolute left-4 top-4 shadow-md">
              {tag}
            </Badge>
          ) : null}

          <div
            class="absolute inset-x-4 bottom-4"
            style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.8)" }}
          >
            <h3 class="text-lg font-bold text-white">{city}</h3>
            <p class="mt-0.5 flex items-center gap-1 text-xs font-semibold text-white">
              <MapPin class="h-3.5 w-3.5" />
              {country}
            </p>
          </div>
        </div>

        <div class="flex flex-1 flex-col p-5">
          <p class="text-sm leading-relaxed text-navy-600">{description}</p>

          <div class="mt-auto flex items-end justify-between gap-4 border-t border-navy-100 pt-5">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">
                From
              </p>
              <p class="mt-1 text-xl font-extrabold text-navy-900">
                ${startingPrice}
                <span class="text-xs font-medium text-navy-400"> / one way</span>
              </p>
            </div>

            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-500 text-white transition-colors duration-300 group-hover:bg-navy-900">
              <ArrowUpRight class="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
