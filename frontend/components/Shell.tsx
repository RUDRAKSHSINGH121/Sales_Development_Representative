"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Mail,
  History,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Layers
} from "lucide-react";
import { api } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/qualification", label: "AI Qualification", icon: Sparkles },
  { href: "/email-generator", label: "Email Generator", icon: Mail },
  { href: "/email-history", label: "Email History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("leadpilot_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    api<{ id: number; name: string; email: string }>("/auth/me")
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("leadpilot_token");
        router.replace("/login");
      });
  }, [router]);

  const displayName = user?.name && user.name !== "Demo User" ? user.name : "Rudraksh Singh";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("leadpilot_token");
    router.push("/login");
  };

  return (
    <div className="shell">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-icon-wrap">
            <Layers size={22} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <span className="brand-name">LeadPilot</span>
            <span className="brand-sub">AI-powered SDR Platform</span>
          </div>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at Sidebar Bottom */}
        <div className="sidebar-user">
          <div className="user-avatar-circle">{initials}</div>
          <div className="user-meta">
            <div className="user-meta-name">{displayName}</div>
            <span className="user-meta-role">Sales workspace</span>
          </div>
          <button
            onClick={handleLogout}
            className="logout-btn"
            title="Sign out"
            type="button"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main">
        {/* Topbar Header */}
        <header className="topbar">
          <div className="topbar-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search leads, companies, or keywords..."
            />
          </div>

          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Notifications" type="button">
              <Bell size={17} />
              <span className="topbar-badge-dot" />
            </button>

            <Link href="/settings" className="topbar-user-badge">
              <div className="topbar-user-avatar">{initials}</div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
                {displayName}
              </span>
              <ChevronDown size={14} color="#64748B" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
