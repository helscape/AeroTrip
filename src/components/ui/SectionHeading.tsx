interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  class?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  class: className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";

  return (
    <div class={`${alignment} ${className}`}>
      {eyebrow ? (
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">
          {eyebrow}
        </p>
      ) : null}

      <h2 class="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-navy-900 text-balance sm:text-4xl">
        {title}
      </h2>

      {description ? (
        <p class="mt-4 text-base leading-relaxed text-navy-500">{description}</p>
      ) : null}
    </div>
  );
}
