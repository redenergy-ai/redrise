"use client";

import { useState } from "react";
import { AlertTriangle, Brain, Heart, LogIn, LogOut, MessageCircle, Settings, User2 } from "lucide-react";
import { NavItem } from "./NavItem";
import { ConversationList } from "./ConversationList";
import type { ConversationSummary } from "@/lib/health-store";
import type { SupportedLanguage } from "@/lib/i18n";

export type NavView =
  | "home"
  | "chat"
  | "emergency"
  | "topics"
  | "records"
  | "medications"
  | "appointments"
  | "vitals"
  | "health-dashboard"
  | "schedule"
  | "history"
  | "settings"
  | "login"
  | "profile"
  | "ehr-wizard"
  | "my-medicines"
  | "share"
  | "admin"
  | "nearby"
  | "contacts";

interface SidebarProps {
  activeNav: NavView;
  setActiveNav: (nav: NavView) => void;
  language?: SupportedLanguage;
  advancedMode?: boolean;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  conversations?: ConversationSummary[];
  activeConversationId?: string | null;
  onOpenConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  username?: string;
  email?: string;
  onLogout?: () => void;
  onNewChat?: () => void;
}

export function Sidebar({
  activeNav,
  setActiveNav,
  isAuthenticated = false,
  conversations = [],
  activeConversationId,
  onOpenConversation,
  onDeleteConversation,
  username,
  email,
  onLogout,
  onNewChat,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`hidden md:flex flex-col border-r border-line/60 bg-surface-1/80 backdrop-blur-xl p-3 transition-all ${collapsed ? "w-[68px]" : "w-64"}`}>
      <button onClick={() => setCollapsed((value) => !value)} className="mb-4 flex items-center gap-2 rounded-xl p-2 hover:bg-surface-2" aria-label="Toggle sidebar">
        <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white"><Heart size={17} /></div>
        {!collapsed && <div className="text-left"><p className="font-bold text-ink-base leading-none">RedRise</p><p className="text-[10px] text-ink-subtle mt-1">Rise from the fog.</p></div>}
      </button>

      {onNewChat && <NavItem icon={MessageCircle} label="New chat" active={activeNav === "home" || activeNav === "chat"} onClick={onNewChat} collapsed={collapsed} />}

      {isAuthenticated && (
        <>
          {!collapsed && <p className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-subtle">Your wellbeing</p>}
          <NavItem icon={Brain} label="Daily check-in & weekly summary" active={activeNav === "health-dashboard"} onClick={() => setActiveNav("health-dashboard")} collapsed={collapsed} />
        </>
      )}

      {onOpenConversation && onDeleteConversation && (
        <div className="mt-3 flex-1 overflow-y-auto">
          <ConversationList conversations={conversations} activeId={activeConversationId} onOpen={onOpenConversation} onDelete={onDeleteConversation} collapsed={collapsed} label="Recent chats" />
        </div>
      )}

      <div className="mt-auto space-y-1 border-t border-line/50 pt-3">
        <NavItem icon={AlertTriangle} label="Crisis & emergency help" active={activeNav === "emergency"} onClick={() => setActiveNav("emergency")} urgent collapsed={collapsed} />
        <NavItem icon={Settings} label="Settings" active={activeNav === "settings"} onClick={() => setActiveNav("settings")} collapsed={collapsed} />
        {isAuthenticated ? (
          <>
            <NavItem icon={User2} label={username || email || "Account"} active={activeNav === "profile"} onClick={() => setActiveNav("profile")} collapsed={collapsed} />
            <NavItem icon={LogOut} label="Sign out" active={false} onClick={() => onLogout?.()} collapsed={collapsed} />
          </>
        ) : (
          <NavItem icon={LogIn} label="Log in / Create account" active={activeNav === "login"} onClick={() => setActiveNav("login")} collapsed={collapsed} />
        )}
      </div>
    </aside>
  );
}
