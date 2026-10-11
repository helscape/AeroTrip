import type { ComponentChildren } from "preact";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/sections/Footer";

interface MainLayoutProps {
  children: ComponentChildren;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div class="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <Navbar />
      <main class="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
