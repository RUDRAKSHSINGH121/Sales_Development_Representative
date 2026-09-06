"use client";

import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Shield,
  Key,
  Bell,
  Sliders,
  Check,
  Camera
} from "lucide-react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";

type SettingsTab = "profile" | "security" | "apikeys" | "notifications" | "preferences";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [name, setName] = useState("Rudraksh Singh");
  const [email, setEmail] = useState("rudraksh@company.com");
  const [company, setCompany] = useState("LeadPilot");
  const [role, setRole] = useState("SDR Intern");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ id: number; name: string; email: string }>("/auth/me")
      .then((u) => {
        setUser(u);
        if (u.name) setName(u.name);
        if (u.email) setEmail(u.email);
      })
      .catch(() => null);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "RS";

  return (
    <Shell>
      <div className="page">
        {/* Page Header */}
        <div className="pagehead">
          <div>
            <h1>Settings</h1>
            <p className="muted">Manage your account and preferences.</p>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left Vertical Navigation Tabs */}
          <div
            className="card"
            style={{
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {[
              { id: "profile", label: "Profile", icon: UserIcon },
              { id: "security", label: "Security", icon: Shield },
              { id: "apikeys", label: "API Keys", icon: Key },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "preferences", label: "Preferences", icon: Sliders },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as SettingsTab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: 0,
                    background: isActive ? "#EFF6FF" : "transparent",
                    color: isActive ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon size={16} color={isActive ? "#2563EB" : "#64748B"} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content Panel */}
          <div className="card" style={{ padding: "28px" }}>
            {activeTab === "profile" && (
              <form onSubmit={handleSave}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: "20px",
                    borderBottom: "1px solid #F1F5F9",
                    paddingBottom: "12px",
                  }}
                >
                  Profile Information
                </h3>

                {/* Avatar Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </div>

                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: "13px" }}
                    onClick={() => alert("Photo upload feature")}
                  >
                    <Camera size={14} /> Change Photo
                  </button>
                </div>

                <div className="formgrid">
                  <div className="field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Work Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "28px",
                    paddingTop: "16px",
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  {saved ? (
                    <span
                      style={{
                        color: "var(--success-text)",
                        fontSize: "13px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Check size={16} /> Changes saved successfully!
                    </span>
                  ) : (
                    <span />
                  )}

                  <button className="btn" type="submit">
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    borderBottom: "1px solid #F1F5F9",
                    paddingBottom: "12px",
                  }}
                >
                  Security & Password
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "420px" }}>
                  <div className="field">
                    <label>Current Password</label>
                    <input type="password" placeholder="••••••••••••" />
                  </div>
                  <div className="field">
                    <label>New Password</label>
                    <input type="password" placeholder="Minimum 8 characters" />
                  </div>
                  <div className="field">
                    <label>Confirm New Password</label>
                    <input type="password" placeholder="Re-enter password" />
                  </div>
                  <button
                    className="btn"
                    style={{ alignSelf: "flex-start", marginTop: "10px" }}
                    onClick={() => alert("Password updated successfully")}
                    type="button"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === "apikeys" && (
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    borderBottom: "1px solid #F1F5F9",
                    paddingBottom: "12px",
                  }}
                >
                  AI API Configuration
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* OpenAI Provider Card */}
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <b style={{ color: "#166534", fontSize: "14px" }}>
                        1. OpenAI API: Connected (Lead Qualification)
                      </b>
                      <p style={{ margin: "4px 0 0", color: "#15803D", fontSize: "12.5px" }}>
                        Powers Objective 4 structured ICP scoring (0-100), qualification status, reasoning, and key signals.
                      </p>
                    </div>
                    <span className="badge qualified">Active</span>
                  </div>

                  <div className="field">
                    <label>OpenAI Model Engine</label>
                    <input
                      value="gpt-4o-mini (structured JSON response format)"
                      readOnly
                      style={{ background: "#F8FAFC" }}
                    />
                  </div>

                  {/* Google Gemini Provider Card */}
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <b style={{ color: "#1E40AF", fontSize: "14px" }}>
                        2. Google Gemini API: Connected (Email Generation)
                      </b>
                      <p style={{ margin: "4px 0 0", color: "#2563EB", fontSize: "12.5px" }}>
                        Powers Objective 5 personalized B2B outreach email drafts tailored to verified lead context.
                      </p>
                    </div>
                    <span className="badge blue">Active</span>
                  </div>

                  <div className="field">
                    <label>Gemini Model Engine</label>
                    <input
                      value="gemini-3.6-flash / gemini-flash-latest (Google GenAI)"
                      readOnly
                      style={{ background: "#F8FAFC" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    borderBottom: "1px solid #F1F5F9",
                    paddingBottom: "12px",
                  }}
                >
                  Notification Preferences
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked />
                    Email me when a prospect achieves high qualification score (&gt; 80)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked />
                    Weekly pipeline digest and AI outreach conversion summary
                  </label>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    borderBottom: "1px solid #F1F5F9",
                    paddingBottom: "12px",
                  }}
                >
                  Workspace Preferences
                </h3>
                <div className="formgrid">
                  <div className="field">
                    <label>Default Currency</label>
                    <select defaultValue="USD">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Timezone</label>
                    <select defaultValue="UTC+05:30">
                      <option value="UTC+05:30">Asia/Kolkata (UTC+05:30)</option>
                      <option value="UTC-08:00">America/Los_Angeles (PST)</option>
                      <option value="UTC-05:00">America/New_York (EST)</option>
                      <option value="UTC+00:00">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
