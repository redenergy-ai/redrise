"use client";

import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  consent_given?: boolean;
  consent_date?: string | null;
  partner_data_sharing_consent?: boolean;
  partner_data_sharing_consent_date?: string | null;
}

export type RegistrationOptions = {
  displayName?: string;
  consent_given: boolean;
  consent_date: string;
  partner_data_sharing_consent: boolean;
  partner_data_sharing_consent_date?: string | null;
};

const TOKEN_KEY = "medos_auth_token";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `medos_token=${t}; path=/; max-age=${30 * 86400}; SameSite=Lax${secure}`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = "medos_token=; path=/; max-age=0";
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) { setLoading(false); return; }
    fetch("/api/proxy/auth/me", { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          persistToken(t);
          setUser(data.user);
        } else {
          persistToken(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [persistToken]);

  const register = useCallback(
    async (email: string, password: string, opts: RegistrationOptions) => {
      if (!opts?.consent_given) {
        return { ok: false as const, error: "Health-related data processing consent is required to create an account." };
      }
      try {
        const res = await fetch("/api/proxy/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            displayName: opts.displayName,
            consent_given: opts.consent_given,
            consent_date: opts.consent_date,
            partner_data_sharing_consent: opts.partner_data_sharing_consent,
            partner_data_sharing_consent_date: opts.partner_data_sharing_consent_date || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false as const, error: data.error || "Registration failed" };
        persistToken(data.token);
        setUser(data.user);
        return { ok: true as const, needsVerification: !data.user.emailVerified };
      } catch {
        return { ok: false as const, error: "Network error" };
      }
    },
    [persistToken],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const attempt = async () =>
        fetch("/api/proxy/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      try {
        let res = await attempt();
        let data = await res.json().catch(() => ({}));
        if (!res.ok && data?.code === "backend_cold_start") {
          res = await attempt();
          data = await res.json().catch(() => ({}));
        }
        if (!res.ok) return { ok: false as const, error: data.error || "Login failed" };
        persistToken(data.token);
        setUser(data.user);
        return { ok: true as const };
      } catch {
        return { ok: false as const, error: "Network error" };
      }
    },
    [persistToken],
  );

  const verifyEmail = useCallback(async (code: string) => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const res = await fetch("/api/proxy/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false as const, error: data.error };
      setUser((u) => (u ? { ...u, emailVerified: true } : u));
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Network error" };
    }
  }, []);

  const resendVerification = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    await fetch("/api/proxy/auth/resend-verification", {
      method: "POST",
      headers: { Authorization: `Bearer ${t}` },
    }).catch(() => {});
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const res = await fetch("/api/proxy/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { ok: res.ok, message: data.message || data.error };
    } catch {
      return { ok: false, message: "Network error" };
    }
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      const res = await fetch("/api/proxy/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false as const, error: data.error };
      if (data.token) persistToken(data.token);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Network error" };
    }
  }, [persistToken]);

  const updatePartnerDataSharingConsent = useCallback(async (enabled: boolean) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return { ok: false as const, error: "Not authenticated" };
    const now = new Date().toISOString();
    try {
      const res = await fetch("/api/proxy/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({
          partner_data_sharing_consent: enabled,
          partner_data_sharing_consent_date: now,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false as const, error: data.error || "Could not update consent" };
      setUser((u) => u ? {
        ...u,
        partner_data_sharing_consent: enabled,
        partner_data_sharing_consent_date: now,
        ...(data.user || {}),
      } : u);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) fetch("/api/proxy/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  const deleteMe = useCallback(async (password: string, confirmEmail: string) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return { ok: false as const, error: "Not authenticated" };
    try {
      const res = await fetch("/api/proxy/auth/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ password, confirmEmail, purge_personal_data: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false as const, error: data.error || "Account deletion failed" };
      persistToken(null);
      setUser(null);
      return { ok: true as const, message: data.message };
    } catch {
      return { ok: false as const, error: "Network error" };
    }
  }, [persistToken]);

  return {
    user,
    token,
    isAuthenticated: !!user,
    isGuest: !user,
    loading,
    register,
    login,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updatePartnerDataSharingConsent,
    logout,
    deleteMe,
  };
}
