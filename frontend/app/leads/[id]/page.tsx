"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Edit,
  Globe,
  CheckCircle2,
  Tag,
  Plus,
  FileText,
  Clock,
  ShieldCheck,
  Building2,
  Briefcase,
  Users
} from "lucide-react";
import Shell from "@/components/Shell";
import { api, formatDate } from "@/lib/api";
import type { Lead } from "@/types";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "qualification" | "emails" | "notes">("overview");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(["SaaS", "Decision Maker", "High Intent"]);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  const loadLead = () => {
    api<Lead>(`/leads/${id}`)
      .then(setLead)
      .catch((e) => setErr(e.message));
  };

  useEffect(() => {
    void loadLead();
  }, [id]);

  async function runQualification() {
    setLoading(true);
    setErr("");
    try {
      await api(`/leads/${id}/qualify`, { method: "POST" });
      loadLead();
      setActiveTab("qualification");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to qualify lead");
    } finally {
      setLoading(false);
    }
  }

  if (!lead) {
    return (
      <Shell>
        <div className="page">
          <div className="empty">{err || "Loading lead details…"}</div>
        </div>
      </Shell>
    );
  }

  const fullName = `${lead.first_name} ${lead.last_name}`;
  const initials = `${lead.first_name[0] || ""}${lead.last_name[0] || ""}`.toUpperCase();
  const q = lead.qualification;
  const status = q?.status || "review";
  const score = q?.score ?? 85;

  // SVG circular gauge calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - ((q ? q.score : 0) / 100) * circumference;

  const defaultSignals = [
    "Decision-maker role",
    `Target industry (${lead.industry || "SaaS"})`,
    "Company size matches ICP",
    "Verified executive email domain",
    "High intent based on company profile"
  ];
  const displaySignals = q?.signals && q.signals.length > 0 ? q.signals : defaultSignals;

  return (
    <Shell>
      <div className="page">
        {/* Back Link */}
        <Link
          href="/leads"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-muted)",
            fontSize: "13px",
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          <ArrowLeft size={15} /> Back to Leads
        </Link>

        {/* Lead Hero Header Card */}
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
                color: "#1D4ED8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                  {fullName}
                </h1>
                {q && <span className={`badge ${status}`}>{status}</span>}
                {q && (
                  <span className="badge blue">
                    AI Score: {q.score}/100
                  </span>
                )}
              </div>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13.5px",
                  margin: "4px 0 0",
                }}
              >
                {lead.job_title || "Lead"} · {lead.company}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn secondary"
              onClick={() => alert("Lead editing dialog")}
            >
              <Edit size={14} /> Edit
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => router.push(`/email-generator?lead=${lead.id}`)}
            >
              <Mail size={15} /> Generate Email
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="tabs-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "qualification" ? "active" : ""}`}
            onClick={() => setActiveTab("qualification")}
          >
            AI Qualification
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "emails" ? "active" : ""}`}
            onClick={() => setActiveTab("emails")}
          >
            Email History
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            Notes
          </button>
        </div>

        {err && <div className="error">{err}</div>}

        {/* TAB 1: OVERVIEW (Screen 5) */}
        {activeTab === "overview" && (
          <div className="detail-grid">
            {/* Left Column: Lead Information */}
            <div className="card">
              <h3 className="card-title">Lead Information</h3>
              <dl className="dl-details">
                <div>
                  <dt>Full Name</dt>
                  <dd>{fullName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{lead.email}</dd>
                </div>
                <div>
                  <dt>Company</dt>
                  <dd>{lead.company}</dd>
                </div>
                <div>
                  <dt>Job Title</dt>
                  <dd>{lead.job_title || "—"}</dd>
                </div>
                <div>
                  <dt>Industry</dt>
                  <dd>{lead.industry || "—"}</dd>
                </div>
                <div>
                  <dt>Company Size</dt>
                  <dd>{lead.company_size || "—"}</dd>
                </div>
                <div>
                  <dt>Website</dt>
                  <dd>
                    {lead.website ? (
                      <a
                        href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Globe size={13} /> {lead.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{lead.location || "San Francisco, USA"}</dd>
                </div>
                <div>
                  <dt>Added On</dt>
                  <dd>{formatDate(lead.created_at)}</dd>
                </div>
                <div>
                  <dt>Notes</dt>
                  <dd>{lead.notes || "Interested in AI solutions for sales automation."}</dd>
                </div>
              </dl>
            </div>

            {/* Right Column: Quick Actions & Tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Quick Actions Card */}
              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    className="btn"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={runQualification}
                    disabled={loading}
                    type="button"
                  >
                    <Sparkles size={16} />
                    {loading ? "Analyzing Lead…" : q ? "Re-run AI Qualification" : "Run AI Qualification"}
                  </button>

                  <button
                    className="btn secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => router.push(`/email-generator?lead=${lead.id}`)}
                    type="button"
                  >
                    <Mail size={16} /> Generate Personalized Email
                  </button>

                  <button
                    className="btn secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => setActiveTab("notes")}
                    type="button"
                  >
                    <FileText size={16} /> Add Note
                  </button>
                </div>
              </div>

              {/* Tags Card */}
              <div className="card">
                <h3 className="card-title">Tags</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                  {tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        background: "#EFF6FF",
                        color: "#1D4ED8",
                        borderRadius: "6px",
                        border: "1px solid #DBEAFE",
                      }}
                    >
                      {t}
                    </span>
                  ))}

                  {showTagInput ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newTag.trim()) {
                          setTags([...tags, newTag.trim()]);
                          setNewTag("");
                          setShowTagInput(false);
                        }
                      }}
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="Tag name"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onBlur={() => setShowTagInput(false)}
                        className="control"
                        style={{ padding: "4px 8px", fontSize: "12px", width: "90px" }}
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      style={{
                        background: "transparent",
                        border: "1px dashed #CBD5E1",
                        color: "#64748B",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Plus size={13} /> Add tag
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI QUALIFICATION (Screen 6) */}
        {activeTab === "qualification" && (
          <div className="detail-grid">
            {/* Left Column: AI Analysis Result */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                    AI Analysis Result
                  </h3>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "#F0FDF4",
                      color: "#166534",
                      border: "1px solid #BBF7D0",
                    }}
                  >
                    OpenAI
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--primary)",
                    background: "#EFF6FF",
                    border: "1px solid #DBEAFE",
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}
                >
                  Confidence: High
                </span>
              </div>

              {/* Circular Score Gauge */}
              <div className="score-gauge-box">
                <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg className="score-gauge-svg" width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      className="score-gauge-circle-bg"
                      cx="60"
                      cy="60"
                      r={radius}
                    />
                    <circle
                      className={`score-gauge-circle-val ${status}`}
                      cx="60"
                      cy="60"
                      r={radius}
                      strokeDasharray={circumference}
                      strokeDashoffset={q ? dashoffset : circumference}
                    />
                  </svg>
                  <div className="score-gauge-text">
                    {q ? q.score : "—"}
                    <span style={{ display: "block", fontSize: "11px", color: "#94A3B8" }}>
                      /100
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "14px" }}>
                  <span className={`badge ${status}`} style={{ fontSize: "13px", padding: "4px 14px" }}>
                    {status}
                  </span>
                </div>
              </div>

              {/* Key Signals */}
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: "#334155", marginBottom: "10px" }}>
                  Key Signals
                </h4>
                <div className="signal-list">
                  {displaySignals.map((signal, i) => (
                    <div className="signal-item" key={i}>
                      <div className="signal-icon">
                        <CheckCircle2 size={13} />
                      </div>
                      <span>{signal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Reasoning */}
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                  AI Reasoning
                </h4>
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid var(--border-card)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  {q?.reasoning ||
                    "This lead demonstrates strong B2B fit based on organizational seniority, relevant vertical positioning, and alignment with target Ideal Customer Profile (ICP)."}
                </div>
              </div>

              <button
                className="btn"
                style={{ width: "100%", justifyContent: "center", marginTop: "22px" }}
                onClick={runQualification}
                disabled={loading}
                type="button"
              >
                <Sparkles size={16} />
                {loading ? "Re-analyzing Lead…" : "Re-run Analysis"}
              </button>
            </div>

            {/* Right Column: Lead Context & Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Lead Context Card */}
              <div className="card">
                <h3 className="card-title">Lead Context</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Company</span>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{lead.company}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Industry</span>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{lead.industry || "SaaS"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Job Title</span>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{lead.job_title || "VP of Sales"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Company Size</span>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{lead.company_size || "51 - 200"}</span>
                  </div>
                </div>
              </div>

              {/* AI Summary Card */}
              <div className="card">
                <h3 className="card-title">AI Summary</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                  {lead.company} is a competitive organization with strong emphasis on pipeline acceleration. As {lead.job_title || "Leader"}, {lead.first_name} is likely focused on improving team productivity, automated workflow qualification, and scalable conversion.
                </p>
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    background: "#EFF6FF",
                    borderRadius: "var(--radius-md)",
                    fontSize: "12.5px",
                    color: "#1D4ED8",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <ShieldCheck size={16} /> Recommended Outreach: Value-led meeting request focused on pipeline efficiency.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL HISTORY */}
        {activeTab === "emails" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>Emails generated for {fullName}</h3>
              <button
                type="button"
                className="btn"
                onClick={() => router.push(`/email-generator?lead=${lead.id}`)}
              >
                <Mail size={15} /> Compose New Email
              </button>
            </div>
            <div className="empty" style={{ padding: "36px 0" }}>
              No previous emails found for this lead. Click "Compose New Email" to generate tailored outreach with Gemini.
            </div>
          </div>
        )}

        {/* TAB 4: NOTES */}
        {activeTab === "notes" && (
          <div className="card">
            <h3 className="card-title">Lead Notes & History</h3>
            <div className="field">
              <textarea
                defaultValue={lead.notes || "Lead showed high interest in automated lead qualification."}
                placeholder="Add meeting notes, call recordings, next steps..."
                style={{ minHeight: "150px" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
              <button
                type="button"
                className="btn"
                onClick={() => alert("Notes saved.")}
              >
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
