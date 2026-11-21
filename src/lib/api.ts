import type {
  ApiAirport,
  Booking,
  BookingDraft,
  BookingSummary,
  Flight,
  SearchResult,
  TokenResponse,
  User,
} from "@/types";

const BASE = import.meta.env.VITE_API_URL ?? "";
export const TOKEN_KEY = "aerotrip.token";

interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown[] };
}

/** Error thrown for any non-2xx response from the API. */
export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function authHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ErrorBody | null;
    throw new ApiRequestError(
      res.status,
      body?.error?.code ?? "REQUEST_FAILED",
      body?.error?.message ?? res.statusText,
    );
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

type QueryValue = string | number | undefined | null;

function query(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export const api = {
  /* ---- public ---- */
  airports: (q?: string) => request<ApiAirport[]>(`/api/airports${query({ q })}`),

  search: (params: Record<string, QueryValue>) =>
    request<SearchResult>(`/api/flights/search${query(params)}`),

  flight: (id: string) => request<Flight>(`/api/flights/${encodeURIComponent(id)}`),

  createBooking: (draft: BookingDraft) =>
    request<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(draft) }),

  getBooking: (reference: string, email: string) =>
    request<Booking>(`/api/bookings/${encodeURIComponent(reference)}${query({ email })}`),

  ticketUrl: (reference: string, email: string) =>
    `${BASE}/api/bookings/${encodeURIComponent(reference)}/ticket${query({ email })}`,

  listBookings: (email: string) =>
    request<BookingSummary[]>(`/api/bookings${query({ email })}`),

  updateBooking: (
    id: string,
    reference: string,
    email: string,
    payload: { contactEmail: string; contactPhone?: string },
  ) =>
    request<Booking>(
      `/api/bookings/${encodeURIComponent(id)}${query({ reference, email })}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),

  cancelBooking: (id: string, reference: string, email: string) =>
    request<void>(
      `/api/bookings/${encodeURIComponent(id)}${query({ reference, email })}`,
      { method: "DELETE" },
    ),

  /* ---- account ---- */
  register: (payload: { email: string; password: string; fullName: string; phone?: string }) =>
    request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => request<User>("/api/auth/me"),

  updateMe: (payload: { fullName?: string; phone?: string }) =>
    request<User>("/api/auth/me", { method: "PATCH", body: JSON.stringify(payload) }),

  myBookings: () => request<BookingSummary[]>("/api/me/bookings"),
};
