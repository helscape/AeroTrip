import { Compass } from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function NotFoundPage() {
  return (
    <Container class="py-24 text-center">
      <Compass class="mx-auto h-12 w-12 text-navy-300" />
      <h1 class="mt-6 text-3xl font-extrabold text-navy-900">Page not found</h1>
      <p class="mt-2 text-sm text-navy-500">
        That route does not exist. Let's get you back in the air.
      </p>
      <Button href="/" class="mt-6">
        Back to home
      </Button>
    </Container>
  );
}
