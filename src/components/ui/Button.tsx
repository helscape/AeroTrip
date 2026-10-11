import type { ComponentChildren } from "preact";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "light";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-800",
  secondary: "bg-sky-500 text-white hover:bg-sky-600",
  outline:
    "border border-navy-200 bg-white text-navy-900 hover:border-navy-300 hover:bg-navy-50",
  ghost: "text-navy-600 hover:bg-navy-50 hover:text-navy-900",
  light: "bg-white text-navy-900 hover:bg-navy-50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm sm:text-base",
};

interface ButtonProps {
  children: ComponentChildren;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When provided the button renders as an anchor. */
  href?: string;
  class?: string;
  "aria-label"?: string;
}

/**
 * Presentational button. Renders an <a> when `href` is set, otherwise a
 * <button type="button">. No click handlers by design — this is UI only.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  class: className = "",
  ...rest
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href) {
    return (
      <a href={href} class={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" class={classes} {...rest}>
      {children}
    </button>
  );
}
