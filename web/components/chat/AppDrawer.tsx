"use client";

import { useEffect } from "react";
import { AlertTriangle, Brain, Heart, LogIn, LogOut, MessageCircle, Settings, User2, X } from "lucide-react";
import { ConversationList } from "./ConversationList";
import type { ConversationSummary } from "@/lib/health-store";
import type { SupportedLanguage } from "@/lib/i18n";

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  activeKey: string;
  onNavigate: (key: string) => void;
  onNewChat?: () => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  username?: string;
  onLogout?: () => void;
  conversations?: ConversationSummary[];
  activeConversationId?: string | null;
  onOpenConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  language: SupportedLanguage;
}

export function AppDrawer({
  open,
  onClose,
  activeKey,
  onNavigate,
  onNewChat,
  isAuthenticated = false,
  username,
  onLogout,
  conversations = [],
  activeConversationId,
  onOpenConversation,
  onDeleteConversation,
}: AppDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const nav = (key: string) => {
    onNavigate(key);
    onClose();
  };

  return (
    <div className={`md:hidden fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-surface-1 border-r border-line/40 shadow-card flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 pt-5 pb-3 safe-area-top">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white"><Heart size={16} /></div>
            <div><div className="text-sm font-bold text-ink-base">RedRise</div><div className="text-[11px] text-ink-muted">Rise from the fog.</div></div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-subtle hover:bg-surface-2" aria-label="Close menu"><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <DrawerItem icon={MessageCircle} label="New chat" active={activeKey === "home" || activeKey === "chat"} onClick={() => { onNewChat?.(); onClose(); }} />
          {isAuthenticated && <DrawerItem icon={Brain} label="Daily check-in & weekly summary" active={activeKey === "health-dashboard"} onClick={() => nav("health-dashboard")} />}

          {onOpenConversation && onDeleteConversation && (
            <div className="py-3">
              <ConversationList conversations={conversations} activeId={activeConversationId} onOpen={(id) => { onOpenConversation(id); onClose(); }} onDelete={onDeleteConversation} label="Recent chats" />
            </div>
          )}

          <div className="pt-3 border-t border-line/40">
            <DrawerItem icon={AlertTriangle} label="Crisis & emergency help" active={activeKey === "emergency"} onClick={() => nav("emergency")} urgent />
            <DrawerItem icon={Settings} label="Settings" active={activeKey === "settings"} onClick={() => nav("settings")} />
            {isAuthenticated ? (
              <>
                <DrawerItem icon={User2} label={username || "Account"} active={activeKey === "profile"} onClick={() => nav("profile")} />
                <DrawerItem icon={LogOut} label="Sign out" active={false} onClick={() => { onLogout?.(); onClose(); }} />
              </>
            ) : (
              <DrawerItem icon={LogIn} label="Log in / Create account" active={activeKey === "login"} onClick={() => nav("login")} />
            )}
          </div>
        </nav>
      </aside>
    </div>
  );
}

function DrawerItem({ icon: Icon, label, active, onClick, urgent = false }: { icon: any; label: string; active: boolean; onClick: () => void; urgent?: boolean }) {
  return (
    <button onClick={onClick} className={`w-full h-11 rounded-xl px-3 flex items-center gap-3 text-left text-sm transition-colors ${active ? (urgent ? "bg-danger-500/10 text-danger-500 font-semibold" : "bg-brand-500/10 text-brand-600 font-semibold") : urgent ? "text-danger-500 hover:bg-danger-500/5" : "text-ink-muted hover:bg-surface-2 hover:text-ink-base"}`}>
      <Icon size={18} /><span className="truncate">{label}</span>
    </button>
  );
}
