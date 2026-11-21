import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import {
  ChevronDown,
  LogOut,
  Menu,
  Plane,
  Ticket,
  UserRound,
  X,
} from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const LINKS = [
  { label: "Book", href: "/" },
  { label: "My Trips", href: "/manage" },
  { label: "Deals", href: "/#deals" },
  { label: "Help", href: "/help" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const signOut = () => {
    logout();
    setAccountOpen(false);
    setMenuOpen(false);
    notify("You've been signed out.", "info");
    location.route("/");
  };

  const accountMenu = (
    <div class="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-navy-100 bg-white p-1.5 shadow-[var(--shadow-float)]">
      <div class="border-b border-navy-100 px-3 py-2.5">
        <p class="truncate text-sm font-bold text-navy-900">{user?.fullName}</p>
        <p class="truncate text-xs text-navy-400">{user?.email}</p>
      </div>
      <Link
        href="/account"
        class="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
        onClick={() => setAccountOpen(false)}
      >
        <UserRound class="h-4 w-4" /> My account
      </Link>
      <Link
        href="/manage"
        class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
        onClick={() => setAccountOpen(false)}
      >
        <Ticket class="h-4 w-4" /> My bookings
      </Link>
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        onClick={signOut}
      >
        <LogOut class="h-4 w-4" /> Sign out
      </button>
    </div>
  );

  return (
    <header class="sticky top-0 z-50 border-b border-navy-100/80 bg-white/90 backdrop-blur-xl">
      <div class="hidden border-b border-navy-50 bg-navy-900 text-white lg:block">
        <Container>
          <div class="flex h-8 items-center justify-end text-[11px] font-medium">
            <Link href="/help" class="text-navy-100 hover:text-white hover:underline">
              Help Center
            </Link>
          </div>
        </Container>
      </div>

      <Container>
        <nav
          class="flex h-16 items-center justify-between gap-4 lg:h-20"
          aria-label="Main navigation"
        >
          <Link href="/" class="flex items-center gap-2.5" aria-label="AeroTrip home">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-sm">
              <Plane class="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span class="text-lg font-extrabold tracking-tight text-navy-900">
              AeroTrip
            </span>
          </Link>

          <ul class="hidden items-center gap-8 lg:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  class="text-sm font-semibold text-navy-600 transition-colors hover:text-navy-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div class="hidden items-center gap-2 lg:flex">
            {user ? (
              <div class="relative">
                <button
                  type="button"
                  class="flex items-center gap-2 rounded-full border border-navy-100 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-navy-800 transition-colors hover:border-navy-200 hover:bg-navy-50"
                  aria-expanded={accountOpen}
                  aria-label="Open account menu"
                  onClick={() => setAccountOpen(!accountOpen)}
                >
                  <span class="grid h-7 w-7 place-items-center rounded-full bg-sky-500 text-xs font-bold text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                  <span class="max-w-[8rem] truncate">{user.fullName.split(" ")[0]}</span>
                  <ChevronDown class="h-3.5 w-3.5 text-navy-400" />
                </button>
                {accountOpen ? accountMenu : null}
              </div>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button href="/login?mode=register" size="sm">
                  Create account
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-xl border border-navy-100 text-navy-700 lg:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X class="h-5 w-5" /> : <Menu class="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen ? (
          <div class="border-t border-navy-100 py-3 lg:hidden">
            <ul class="flex flex-col">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    class="block rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div class="mt-3 flex gap-2 border-t border-navy-100 px-3 pt-3">
              {user ? (
                <>
                  <Button href="/account" variant="outline" size="sm" class="flex-1">
                    My account
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut} class="flex-1">
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/login" variant="outline" size="sm" class="flex-1">
                    Sign in
                  </Button>
                  <Button href="/login?mode=register" size="sm" class="flex-1">
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </Container>

      {accountOpen ? (
        <button
          type="button"
          class="fixed inset-0 top-32 z-40 cursor-default"
          aria-label="Close account menu"
          onClick={() => setAccountOpen(false)}
        />
      ) : null}
    </header>
  );
}
