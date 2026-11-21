import { useEffect, useState } from "preact/hooks";

const IMAGES = [
  "/images/dest-bali.jpg",
  "/images/dest-singapore.jpg",
  "/images/dest-tokyo.jpg",
  "/images/dest-paris.jpg",
  "/images/hero-sky.jpg",
];

const INTERVAL_MS = 8000;

/**
 * Windows Spotlight-style background: a slowly rotating set of travel photos
 * with a solid navy overlay so the search form stays readable. No gradient.
 */
export function SpotlightBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = globalThis.setInterval(
      () => setActive((current) => (current + 1) % IMAGES.length),
      INTERVAL_MS,
    );
    return () => globalThis.clearInterval(timer);
  }, []);

  return (
    <div class="absolute inset-0 -z-10 overflow-hidden bg-navy-950" aria-hidden="true">
      {IMAGES.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          loading={index === 0 ? "eager" : "lazy"}
          class={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 motion-reduce:transition-none ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div class="absolute inset-0 bg-navy-950/60" />
    </div>
  );
}
