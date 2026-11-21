import type { ComponentChildren } from "preact";
import { useLocation } from "preact-iso";

interface LinkProps {
  href: string;
  children: ComponentChildren;
  class?: string;
  "aria-label"?: string;
  onClick?: () => void;
}

function scrollToHash(hash: string) {
  if (!hash) return;
  const id = hash.slice(1);
  globalThis.setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, 50);
}

/** Internal anchor that navigates through the SPA router (no full reload). */
export function Link({
  href,
  children,
  class: className = "",
  onClick,
  ...rest
}: LinkProps) {
  const { route, path } = useLocation();

  const handleClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onClick?.();

    const [targetPath, hash = ""] = href.split("#");
    const normalizedTarget = targetPath || path;

    if (normalizedTarget === path && hash) {
      history.replaceState(null, "", href);
      scrollToHash(`#${hash}`);
      return;
    }

    route(href);
    if (hash) scrollToHash(`#${hash}`);
  };

  return (
    <a href={href} class={className} {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
