"use client";

import { useState } from "react";
import {
  User2,
  LogOut,
  Download,
  Shield,
  Calendar,
  Pill,
  Activity,
  FileText,
  ClipboardList,
  Trash2,
  AlertTriangle,
  PencilLine,
  Database,
} from "lucide-react";
import { t, type SupportedLanguage } from "@/lib/i18n";
import type { User } from "@/lib/hooks/useAuth";

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onExport: () => void;
  onOpenEHR: () => void;
  onDeleteAccount: (
    password: string,
    confirmEmail: string,
  ) => Promise<{ ok: boolean; error?: string; message?: string }>;
  medicationCount: number;
  appointmentCount: number;
  vitalCount: number;
  recordCount: number;
  language: SupportedLanguage;
}

export function ProfileView({
  user,
  onLogout,
  onExport,
  onOpenEHR,
  onDeleteAccount,
  medicationCount,
  appointmentCount,
  vitalCount,
  recordCount,
  language,
}: ProfileViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 pb-mobile-nav scroll-touch">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-gradient flex items-center justify-center shadow-glow">
            <User2 size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-ink-base tracking-tight">{user.displayName || user.email}</h2>
          <p className="text-sm text-ink-muted mt-1">{user.email}</p>
          <span className={`inline-flex items-center gap-1 text-xs mt-1 ${user.emailVerified ? "text-success-500" : "text-warning-500"}`}>
            <Shield size={10} /> {user.emailVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Pill} label={t("nav_medications", language)} value={medicationCount} />
          <StatCard icon={Calendar} label={t("nav_appointments", language)} value={appointmentCount} />
          <StatCard icon={Activity} label={t("nav_vitals", language)} value={vitalCount} />
          <StatCard icon={FileText} label={t("nav_records", language)} value={recordCount} />
        </div>

        <div className="space-y-3 mb-8">
          <button onClick={onOpenEHR} className="w-full flex items-center gap-3 p-4 bg-surface-1 border border-line/60 rounded-2xl shadow-soft text-left hover:border-brand-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center"><ClipboardList size={18} className="text-accent-500" /></div>
            <div><span className="font-bold text-sm text-ink-base block">Wellness profile</span><span className="text-xs text-ink-muted">Review or correct information you have provided</span></div>
          </button>
        </div>

        <MyDataSection user={user} onExport={onExport} onDeleteAccount={onDeleteAccount} />

        <div className="flex items-start gap-3 p-4 bg-surface-2/50 border border-line/40 rounded-2xl mb-8">
          <Shield size={18} className="text-accent-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink-base">Your privacy choices</p>
            <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
              Health-related account data is processed under the consent recorded when you created your account. Optional partner research sharing is controlled separately below.
            </p>
            <a href="/privacy" className="inline-block mt-2 text-xs font-semibold text-brand-500 hover:underline">Privacy Policy</a>
          </div>
        </div>

        <PartnerConsentControl user={user} />

        <button onClick={onLogout} className="w-full mt-8 py-3 border-2 border-danger-500/40 text-danger-500 rounded-xl font-bold text-sm hover:bg-danger-500/10 transition-all flex items-center justify-center gap-2">
          <LogOut size={16} /> Log out
        </button>

        <p className="text-center text-[11px] text-ink-subtle mt-4">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "recently"}</p>
      </div>
    </div>
  );
}

function MyDataSection({ user, onExport, onDeleteAccount }: { user: User; onExport: () => void; onDeleteAccount: ProfileViewProps["onDeleteAccount"] }) {
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const requestCorrection = async () => {
    if (!details.trim()) return;
    setBusy(true); setStatus("");
    try {
      const res = await fetch("/api/privacy/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "correction", user_id: user.id, details: details.trim() }),
      });
      const data = await res.json();
      setStatus(res.ok ? `Correction request received (${data.request_id}).` : data.error || "Request failed");
      if (res.ok) setDetails("");
    } catch {
      setStatus("Request failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-brand-500/25 bg-brand-500/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-1"><Database size={18} className="text-brand-500" /><h3 className="font-bold text-ink-base">My Data</h3></div>
      <p className="text-xs text-ink-muted mb-4">Access, correct, or delete personal information associated with your RedRise account.</p>

      <div className="grid gap-2">
        <button onClick={onExport} className="flex items-center gap-3 rounded-xl border border-line/60 bg-surface-1 p-3 text-left">
          <Download size={16} className="text-brand-500" /><span><strong className="text-sm text-ink-base block">View all stored data</strong><span className="text-xs text-ink-muted">Download your current RedRise data as JSON</span></span>
        </button>
        <button onClick={() => setCorrectionOpen((v) => !v)} className="flex items-center gap-3 rounded-xl border border-line/60 bg-surface-1 p-3 text-left">
          <PencilLine size={16} className="text-brand-500" /><span><strong className="text-sm text-ink-base block">Request correction</strong><span className="text-xs text-ink-muted">Tell us what personal information needs to be corrected</span></span>
        </button>
      </div>

      {correctionOpen && <div className="mt-3 space-y-2"><textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Describe the data that is inaccurate and the correction requested." className="w-full rounded-xl border border-line/60 bg-surface-1 p-3 text-sm text-ink-base" /><button onClick={requestCorrection} disabled={busy || !details.trim()} className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-bold disabled:opacity-50">{busy ? "Sending…" : "Submit correction request"}</button>{status && <p className="text-xs text-ink-muted">{status}</p>}</div>}

      {!user.isAdmin && <DangerZone email={user.email} onDeleteAccount={onDeleteAccount} />}
    </section>
  );
}

function PartnerConsentControl({ user }: { user: User }) {
  const [enabled, setEnabled] = useState(!!user.partner_data_sharing_consent);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const update = async (next: boolean) => {
    const token = localStorage.getItem("medos_auth_token");
    if (!token) { setMessage("Log in again to update consent."); return; }
    setBusy(true); setMessage("");
    const now = new Date().toISOString();
    try {
      const res = await fetch("/api/proxy/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ partner_data_sharing_consent: next, partner_data_sharing_consent_date: now }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage(data.error || "Could not update consent."); return; }
      setEnabled(next);
      setMessage("Consent preference saved.");
    } catch {
      setMessage("Could not update consent.");
    } finally {
      setBusy(false);
    }
  };

  return <section className="rounded-2xl border border-line/60 bg-surface-1 p-4">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-ink-base">Supplement partner research sharing</p><p className="text-xs text-ink-muted mt-1 leading-relaxed">I consent to my anonymized data being shared with supplement partners for research purposes.</p></div><input type="checkbox" checked={enabled} disabled={busy} onChange={(e) => update(e.target.checked)} className="mt-1 h-5 w-5" /></div>
    <p className="text-[11px] text-ink-subtle mt-2">Optional. Off by default. You can change this independently from the health-data processing consent required for an active account.</p>
    {message && <p className="text-xs text-ink-muted mt-2">{message}</p>}
  </section>;
}

function DangerZone({ email, onDeleteAccount }: { email: string; onDeleteAccount: ProfileViewProps["onDeleteAccount"] }) {
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!confirmEmail.trim() || !password) { setError("Type your email and current password to continue."); return; }
    setBusy(true); setError("");
    const res = await onDeleteAccount(password, confirmEmail.trim());
    setBusy(false);
    if (!res.ok) setError(res.error || "Deletion failed");
  };

  return <div className="mt-5 pt-4 border-t border-danger-500/20"><div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-danger-500" /><h4 className="text-xs font-bold uppercase tracking-wider text-danger-500">Request deletion</h4></div><p className="text-xs text-ink-muted mb-3">Permanently close your account and purge associated account and health-related data. This cannot be undone.</p>{!open ? <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-danger-500"><Trash2 size={14} />Delete my account and data</button> : <div className="rounded-2xl border border-danger-500/40 bg-danger-500/5 p-4 space-y-3"><input type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder={email} className="w-full bg-surface-1 border border-line/60 rounded-xl px-3 py-2 text-sm" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Current password" className="w-full bg-surface-1 border border-line/60 rounded-xl px-3 py-2 text-sm" />{error && <p className="text-xs text-danger-500">{error}</p>}<div className="flex gap-2"><button onClick={() => setOpen(false)} disabled={busy} className="flex-1 py-2 rounded-xl border border-line/60 text-sm font-bold">Cancel</button><button onClick={handleSubmit} disabled={busy} className="flex-1 py-2 rounded-xl bg-danger-500 text-white text-sm font-bold disabled:opacity-50">{busy ? "Deleting…" : "Permanently delete"}</button></div></div>}</div>;
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return <div className="p-3 rounded-2xl bg-surface-1 border border-line/60 shadow-soft text-center"><Icon size={16} className="mx-auto text-brand-500 mb-1" /><div className="text-xl font-black text-ink-base">{value}</div><div className="text-[11px] text-ink-muted font-semibold">{label}</div></div>;
}
