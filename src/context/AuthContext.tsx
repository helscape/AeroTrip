import { useContext, useEffect, useState } from "preact/hooks";
import { createContext } from "preact";
import type { ComponentChildren } from "preact";
import { api, TOKEN_KEY } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => void;
  updateProfile: (payload: { fullName?: string; phone?: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ComponentChildren }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token: string | null = null;
    try {
      token = localStorage.getItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          /* ignore */
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const store = (token: string, nextUser: User) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
    setUser(nextUser);
    return nextUser;
  };

  const value: AuthContextValue = {
    user,
    loading,
    login: async (email, password) => {
      const result = await api.login({ email, password });
      return store(result.token, result.user);
    },
    register: async (payload) => {
      const result = await api.register(payload);
      return store(result.token, result.user);
    },
    logout: () => {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore */
      }
      setUser(null);
    },
    updateProfile: async (payload) => {
      const updated = await api.updateMe(payload);
      setUser(updated);
      return updated;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
