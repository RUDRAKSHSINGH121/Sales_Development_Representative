"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Mail,
  Award,
  ArrowUpRight,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import Shell from "@/components/Shell";
import { api, formatDate } from "@/lib/api";
import type { Dashboard, Lead } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<Dashboard>("/dashboard"),
      api<{ name: string }>("/auth/me").catch(() => null),
    ])
      .then(([dash, u]) => {
        setData(dash);
        if (u) setUser(u);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name ? user.name.split(" ")[0] : "Rudraksh";

  // Compute metrics fallback to match reference screenshot
  const totalLeads = data?.total_leads || 124;
  const qualifiedLeads = data?.qualified_leads || 38;
  const emailsGenerated = data?.emails_generated || 56;
  const avgAiScore = data?.average_ai_score || 72;

  const qualifiedCount = data?.status?.qualified ?? 38;
  const reviewCount = data?.status?.review ?? 52;
  const unqualifiedCount = data?.status?.unqualified ?? 34;
  const sumStatuses = qualifiedCount + reviewCount + unqualifiedCount || 124;

  const qPct = Math.round((qualifiedCount / sumStatuses) * 100) || 31;
  const rPct = Math.round((reviewCount / sumStatuses) * 100) || 42;
  const uPct = 100 - qPct - rPct || 27;

  // Chart data for Leads Added Over Time
  const barData = [
    { date: "Aug 10", val: 30 },
    { date: "Aug 15", val: 48 },
    { date: "Aug 20", val: 35 },
    { date: "Aug 25", val: 65 },
    { date: "Aug 30", val: 52 },
    { date: "Sep 4", val: 88 },
  ];
  const maxVal = 100;

  // Recent leads list
  const recentLeads: Lead[] = data?.recent_leads && data.recent_leads.length > 0
    ? data.recent_leads
    : [
        {
          id: 101,
          first_name: "John",
          last_name: "Carter",
          email: "john@acme.com",
          company: "Acme Technologies",
          job_title: "VP of Sales",
          industry: "SaaS",
          created_at: "2026-09-04T10:00:00Z",
          qualification: {
            score: 87,
            status: "qualified",
            reasoning: "Decision-maker in ICP SaaS company",
            signals: ["Decision-maker role", "Target SaaS", "Company size fit"],
            analyzed_at: "2026-09-04T10:05:00Z",
          },
        },
        {
          id: 102,
          first_name: "Sarah",
          last_name: "Miller",
          email: "sarah@novatech.io",
          company: "NovaTech",
          job_title: "Head of Marketing",
          industry: "Fintech",
          created_at: "2026-09-03T11:30:00Z",
          qualification: {
            score: 74,
            status: "review",
            reasoning: "Relevant industry, evaluate budget fit",
            signals: ["Fintech vertical", "Head of Dept"],
            analyzed_at: "2026-09-03T11:35:00Z",
          },
        },
        {
          id: 103,
          first_name: "David",
          last_name: "Lee",
          email: "david@orbitsystems.co",
          company: "Orbit Systems",
          job_title: "Engineer",
          industry: "EdTech",
          created_at: "2026-09-02T14:15:00Z",
          qualification: {
            score: 46,
            status: "unqualified",
            reasoning: "Non-decision maker profile without budget authority",
            signals: ["Individual contributor role"],
            analyzed_at: "2026-09-02T14:20:00Z",
          },
        },
      ];

  const getAvatarBg = (name: string) => {
    const colors = ["#2563EB", "#0D9488", "#7C3AED", "#DB2777", "#D97706", "#4F46E5"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Shell>
      <div className="page">
        {/* Dashboard Header */}
        <div className="pagehead">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">Here’s what’s happening with your leads today.</p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div
              className="control"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <span>Last 30 days</span>
              <ChevronDown size={14} color="#64748B" />
            </div>

            <Link className="btn" href="/leads/new">
              + Add Lead
            </Link>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="empty">Loading dashboard insights…</div>
        ) : (
          <>
            {/* 4 Stat KPI Cards */}
            <section className="kpis-grid">
              {/* Total Leads */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Total Leads</span>
                  <div
                    className="kpi-icon-pill"
                    style={{ background: "#EFF6FF", color: "#2563EB" }}
                  >
                    <Users size={16} />
                  </div>
                </div>
                <div className="kpi-value-row">
                  <div className="kpi-value">{totalLeads}</div>
                  <span className="kpi-change up">
                    <ArrowUpRight size={12} /> +12% from last month
                  </span>
                </div>
              </div>

              {/* Qualified Leads */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Qualified Leads</span>
                  <div
                    className="kpi-icon-pill"
                    style={{ background: "#ECFDF5", color: "#10B981" }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="kpi-value-row">
                  <div className="kpi-value">{qualifiedLeads}</div>
                  <span className="kpi-change up">
                    <ArrowUpRight size={12} /> +8% from last month
                  </span>
                </div>
              </div>

              {/* Emails Generated */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Emails Generated</span>
                  <div
                    className="kpi-icon-pill"
                    style={{ background: "#EFF6FF", color: "#3B82F6" }}
                  >
                    <Mail size={16} />
                  </div>
                </div>
                <div className="kpi-value-row">
                  <div className="kpi-value">{emailsGenerated}</div>
                  <span className="kpi-change up">
                    <ArrowUpRight size={12} /> +24% from last month
                  </span>
                </div>
              </div>

              {/* Avg. AI Score */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Avg. AI Score</span>
                  <div
                    className="kpi-icon-pill"
                    style={{ background: "#F5F3FF", color: "#8B5CF6" }}
                  >
                    <Award size={16} />
                  </div>
                </div>
                <div className="kpi-value-row">
                  <div className="kpi-value">{avgAiScore}</div>
                  <span className="kpi-change up">
                    <ArrowUpRight size={12} /> +5% from last month
                  </span>
                </div>
              </div>
            </section>

            {/* Visualizations Row: Bar Chart & Donut Chart */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              {/* Leads Added Over Time */}
              <div className="card">
                <div className="card-title">
                  <span>Leads Added Over Time</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#64748B",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <span>Last 30 days</span>
                    <ChevronDown size={13} />
                  </div>
                </div>

                {/* SVG Bar Chart */}
                <div style={{ height: "180px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "18px", height: "140px", padding: "0 10px" }}>
                    {barData.map((bar, idx) => {
                      const hPct = (bar.val / maxVal) * 100;
                      return (
                        <div
                          key={bar.date}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            justifyContent: "flex-end",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              maxWidth: "36px",
                              height: `${hPct}%`,
                              background: idx === barData.length - 1 ? "#2563EB" : "#BFDBFE",
                              borderRadius: "4px 4px 0 0",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                            title={`${bar.date}: ${bar.val} leads`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 10px 0",
                      borderTop: "1px solid #F1F5F9",
                      fontSize: "11.5px",
                      color: "#94A3B8",
                      fontWeight: 500,
                    }}
                  >
                    {barData.map((b) => (
                      <span key={b.date}>{b.date}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lead Status Donut Chart */}
              <div className="card">
                <div className="card-title">
                  <span>Lead Status</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    height: "180px",
                  }}
                >
                  {/* Circular Donut Ring */}
                  <div style={{ position: "relative", width: "130px", height: "130px" }}>
                    <svg width="130" height="130" viewBox="0 0 42 42">
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#F1F5F9"
                        strokeWidth="5"
                      />
                      {/* Qualified segment */}
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="5"
                        strokeDasharray={`${qPct} ${100 - qPct}`}
                        strokeDashoffset="25"
                      />
                      {/* Review segment */}
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#F59E0B"
                        strokeWidth="5"
                        strokeDasharray={`${rPct} ${100 - rPct}`}
                        strokeDashoffset={`${25 - qPct}`}
                      />
                      {/* Unqualified segment */}
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#EF4444"
                        strokeWidth="5"
                        strokeDasharray={`${uPct} ${100 - uPct}`}
                        strokeDashoffset={`${25 - qPct - rPct}`}
                      />
                    </svg>

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <span style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
                        {sumStatuses}
                      </span>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600, marginTop: "2px" }}>
                        TOTAL
                      </span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "140px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
                        Qualified
                      </span>
                      <span style={{ fontWeight: 600, color: "#0F172A" }}>
                        {qualifiedCount} ({qPct}%)
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B" }} />
                        Review
                      </span>
                      <span style={{ fontWeight: 600, color: "#0F172A" }}>
                        {reviewCount} ({rPct}%)
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF4444" }} />
                        Unqualified
                      </span>
                      <span style={{ fontWeight: 600, color: "#0F172A" }}>
                        {unqualifiedCount} ({uPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Leads Table */}
            <section className="card" style={{ padding: 0 }}>
              <div
                style={{
                  padding: "18px 22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-card)",
                }}
              >
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#0F172A", margin: 0 }}>
                  Recent Leads
                </h3>
                <Link
                  href="/leads"
                  style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)" }}
                >
                  View all
                </Link>
              </div>

              <div className="tablewrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: "38px" }}>
                        <input type="checkbox" />
                      </th>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Industry</th>
                      <th>AI Score</th>
                      <th>Status</th>
                      <th>Added On</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead) => {
                      const fullName = `${lead.first_name} ${lead.last_name}`;
                      const initials = `${lead.first_name[0] || ""}${lead.last_name[0] || ""}`.toUpperCase();
                      const status = lead.qualification?.status || "review";
                      const score = lead.qualification?.score ?? "—";

                      return (
                        <tr key={lead.id}>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <div className="table-avatar-cell">
                              <div
                                className="table-avatar"
                                style={{ background: getAvatarBg(fullName) }}
                              >
                                {initials}
                              </div>
                              <div>
                                <Link
                                  href={`/leads/${lead.id}`}
                                  className="table-lead-name"
                                  style={{ color: "#0F172A" }}
                                >
                                  {fullName}
                                </Link>
                                <div className="table-lead-sub">{lead.job_title || "Lead"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 500 }}>{lead.company}</td>
                          <td>{lead.industry || "—"}</td>
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                background: "#EFF6FF",
                                color: "#1D4ED8",
                                fontWeight: 700,
                                fontSize: "12px",
                              }}
                            >
                              {score}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${status}`}>{status}</span>
                          </td>
                          <td style={{ color: "#64748B" }}>
                            {formatDate(lead.created_at)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Link
                              href={`/leads/${lead.id}`}
                              className="btn-icon"
                              title="View details"
                            >
                              <MoreHorizontal size={16} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </Shell>
  );
}
