import { useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import type { ComponentChildren } from "preact";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

export function ProtectedRoute({ children }: { children: ComponentChildren }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(location.url);
      location.route(`/login?next=${next}`);
    }
  }, [loading, user]);

  if (loading || !user) return <Spinner label="Checking your session..." />;
  return <>{children}</>;
}
