"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";
import type { Lead } from "@/types";

export default function Qualification() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api<{ items: Lead[] }>("/leads?page_size=100")
      .then((x) => setLeads(x.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function quickQualify(leadId: number) {
    setAnalyzingId(leadId);
    try {
      await api(`/leads/${leadId}/qualify`, { method: "POST" });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to qualify lead");
    } finally {
      setAnalyzingId(null);
    }
  }

  const analyzedLeads = leads.filter((l) => l.qualification);
  const avgScore = analyzedLeads.length
    ? Math.round(analyzedLeads.reduce((acc, l) => acc + (l.qualification?.score || 0), 0) / analyzedLeads.length)
    : 0;
  const qualifiedCount = analyzedLeads.filter((l) => l.qualification?.status === "qualified").length;

  const getAvatarBg = (name: string) => {
    const colors = ["#2563EB", "#0D9488", "#7C3AED", "#DB2777", "#D97706", "#4F46E5"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Shell>
      <div className="page">
        {/* Page Header */}
        <div className="pagehead">
          <div>
            <h1>AI Qualification</h1>
            <p className="muted">
              Review qualification signals, ICP fit, and live scoring across your pipeline.
            </p>
          </div>
          <button
            type="button"
            className="btn secondary"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        {/* Overview Stats */}
        <section className="kpis-grid" style={{ marginBottom: "22px" }}>
          <div className="kpi-card">
            <span className="kpi-label">Analyzed Leads</span>
            <div className="kpi-value-row">
              <div className="kpi-value">{analyzedLeads.length}</div>
              <span className="muted" style={{ fontSize: "12px" }}>
                of {leads.length} total
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Qualified Leads</span>
            <div className="kpi-value-row">
              <div className="kpi-value" style={{ color: "var(--success-text)" }}>
                {qualifiedCount}
              </div>
              <span className="kpi-change up">
                {analyzedLeads.length ? Math.round((qualifiedCount / analyzedLeads.length) * 100) : 0}% fit rate
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Average ICP Score</span>
            <div className="kpi-value-row">
              <div className="kpi-value" style={{ color: "var(--primary)" }}>
                {avgScore}
              </div>
              <span className="muted" style={{ fontSize: "12px" }}>/100</span>
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">AI Engine</span>
            <div className="kpi-value-row">
              <div className="kpi-value" style={{ fontSize: "16px", color: "#1D4ED8", fontWeight: 700 }}>
                OpenAI (GPT-4o mini)
              </div>
            </div>
          </div>
        </section>

        {/* Qualification Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>AI Score</th>
                  <th>Status</th>
                  <th>Reasoning / Signals</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((x) => {
                  const fullName = `${x.first_name} ${x.last_name}`;
                  const initials = `${x.first_name[0] || ""}${x.last_name[0] || ""}`.toUpperCase();
                  const q = x.qualification;
                  const status = q?.status;

                  return (
                    <tr key={x.id}>
                      <td>
                        <div className="table-avatar-cell">
                          <div
                            className="table-avatar"
                            style={{ background: getAvatarBg(fullName) }}
                          >
                            {initials}
                          </div>
                          <div>
                            <Link href={`/leads/${x.id}`} className="table-lead-name">
                              {fullName}
                            </Link>
                            <div className="table-lead-sub">{x.job_title || "Lead"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{x.company}</td>
                      <td>{x.industry || "—"}</td>
                      <td>
                        {q ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: "#EFF6FF",
                              color: "#1D4ED8",
                              fontWeight: 700,
                              fontSize: "12.5px",
                            }}
                          >
                            {q.score}/100
                          </span>
                        ) : (
                          <span style={{ color: "#94A3B8" }}>Not analyzed</span>
                        )}
                      </td>
                      <td>
                        {status ? (
                          <span className={`badge ${status}`}>{status}</span>
                        ) : (
                          <span style={{ color: "#94A3B8" }}>—</span>
                        )}
                      </td>
                      <td style={{ maxWidth: "300px" }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {q ? q.reasoning : "Pending qualification run"}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {q ? (
                          <Link
                            className="btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12.5px" }}
                            href={`/leads/${x.id}`}
                          >
                            View Insights
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: "6px 12px", fontSize: "12.5px" }}
                            disabled={analyzingId === x.id}
                            onClick={() => quickQualify(x.id)}
                          >
                            <Sparkles size={13} />
                            {analyzingId === x.id ? "Analyzing…" : "Qualify"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!loading && leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty">
                      No leads available for qualification. Add prospects to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
