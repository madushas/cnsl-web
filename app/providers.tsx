"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";

export type SessionUser = {
  id?: string;
  email?: string;
  name?: string;
  imageUrl?: string;
  [k: string]: unknown;
} | null;

export type AuthContextValue = {
  user: SessionUser;
  roles: string[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  roles: [],
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({
  children,
  initialUser = null,
  initialRoles = [],
}: {
  children: React.ReactNode;
  initialUser?: SessionUser;
  initialRoles?: string[];
}) {
  const [user, setUser] = useState<SessionUser>(initialUser);
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [loading, setLoading] = useState(!initialUser); // Only load if no initial data

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data?.user ?? null);
        setRoles(Array.isArray(data?.roles) ? data.roles : []);
      } else {
        setUser(null);
        setRoles([]);
      }
    } catch (e) {
      setUser(null);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    if (initialUser === null) {
      load();
    }
  }, [initialUser, load]);

  const value: AuthContextValue = { user, roles, loading, refresh: load };

  return (
    <>
      <Toaster position="top-right" theme="system" richColors closeButton />
      <ErrorBoundary>
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      </ErrorBoundary>
    </>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
