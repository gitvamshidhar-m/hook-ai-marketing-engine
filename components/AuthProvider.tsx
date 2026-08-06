"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { detectReferral } from "@/lib/referral";
import { captureAttribution, getAttribution } from "@/lib/tracking";

type User = { id: string; email: string };
type Profile = { id: string; email: string; name: string; credits: number; role?: string; ref_code?: string; captured_email?: boolean };

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signup: (email: string, password: string, name?: string, ref?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
      setProfile(data.profile || null);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detectReferral();
    captureAttribution();
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setUser(data.user || null);
        setProfile(data.profile || null);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setProfile(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name?: string, ref?: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, ref, attr: getAttribution() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed.");
      await refresh();
    },
    [refresh]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refresh, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
