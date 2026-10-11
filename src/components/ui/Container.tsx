import type { ComponentChildren } from "preact";

interface ContainerProps {
  children: ComponentChildren;
  class?: string;
}

/** Consistent horizontal rhythm + max width across every section. */
export function Container({ children, class: className = "" }: ContainerProps) {
  return (
    <div class={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
