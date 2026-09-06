"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Copy, Check, Mail, Send, ExternalLink } from "lucide-react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";
import type { Lead } from "@/types";

export default function EmailGenerator() {
  return (
    <Suspense fallback={<Shell><div className="page"><div className="empty">Loading email generator…</div></div></Shell>}>
      <EmailGeneratorContent />
    </Suspense>
  );
}

function EmailGeneratorContent() {
  const params = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [lead, setLead] = useState(params.get("lead") || "");
  const [purpose, setPurpose] = useState("Introduction / Outreach");
  const [tone, setTone] = useState("Professional");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<{ items: Lead[] }>("/leads?page_size=100")
      .then((x) => {
        setLeads(x.items || []);
        if (!lead && x.items && x.items.length > 0) {
          setLead(String(x.items[0].id));
        }
      })
      .catch((e) => setErr(e.message));
  }, []);

  async function generate() {
    if (!lead) {
      setErr("Please select a target lead first.");
      return;
    }
    setLoad(true);
    setErr("");
    try {
      const res = await api<{ subject: string; body: string }>(
        `/leads/${lead}/generate-email`,
        {
          method: "POST",
          body: JSON.stringify({ purpose, tone, context }),
        }
      );
      setResult(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not generate email");
    } finally {
      setLoad(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectedLeadObj = leads.find((l) => String(l.id) === lead);

  return (
    <Shell>
      <div className="page">
        {/* Header */}
        <div className="pagehead">
          <div>
            <h1>Generate Personalized Email</h1>
            <p className="muted">
              Create AI-powered, tailored outreach emails for your prospects with Google Gemini.
            </p>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#EFF6FF",
              color: "#1D4ED8",
              fontWeight: 600,
              fontSize: "12.5px",
              border: "1px solid #DBEAFE",
            }}
          >
            <Sparkles size={14} /> Powered by Google Gemini
          </span>
        </div>

        {err && <div className="error">{err}</div>}

        <div className="detail-grid">
          {/* Left Column: Form Settings */}
          <div className="card">
            <div className="field">
              <label>Select Lead</label>
              <select
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                className="control"
              >
                <option value="">Choose a prospect…</option>
                {leads.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.first_name} {x.last_name} — {x.company}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "22px" }}>
              <h4
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "12px",
                  borderBottom: "1px solid #F1F5F9",
                  paddingBottom: "8px",
                }}
              >
                Email Settings
              </h4>

              <div className="formgrid">
                <div className="field">
                  <label>Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  >
                    <option value="Introduction / Outreach">Introduction / Outreach</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Meeting Request">Meeting Request</option>
                    <option value="Product Demo">Product Demo</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>

                <div className="field">
                  <label>Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Persuasive">Persuasive</option>
                    <option value="Concise">Concise</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="field" style={{ marginTop: "16px" }}>
                <label>Additional Content (optional)</label>
                <textarea
                  placeholder="Mention our latest product and request a 15-minute call..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  style={{ minHeight: "100px" }}
                />
              </div>

              <button
                className="btn"
                onClick={generate}
                disabled={load || !lead}
                style={{ width: "100%", justifyContent: "center", marginTop: "22px" }}
                type="button"
              >
                <Sparkles size={16} />
                {load ? "Generating tailored draft…" : "Generate Email"}
              </button>
            </div>
          </div>

          {/* Right Column: Generated Email Preview */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: "12px",
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>
                Generated Email
              </h3>

              {result && (
                <button
                  type="button"
                  className="btn secondary"
                  style={{ padding: "6px 12px", fontSize: "12.5px" }}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>

            {result ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="field">
                  <label style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    Subject Line
                  </label>
                  <input
                    value={result.subject}
                    readOnly
                    style={{
                      background: "#F8FAFC",
                      fontWeight: 600,
                      color: "var(--text-main)",
                    }}
                  />
                </div>

                <div className="field">
                  <label style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    Email Body
                  </label>
                  <textarea
                    value={result.body}
                    readOnly
                    style={{
                      background: "#F8FAFC",
                      minHeight: "260px",
                      lineHeight: 1.6,
                      color: "var(--text-secondary)",
                      whiteSpace: "pre-wrap",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#94A3B8",
                  }}
                >
                  <span>
                    Tailored with Google Gemini for {selectedLeadObj?.first_name} at {selectedLeadObj?.company}
                  </span>
                  <span style={{ color: "var(--success-text)", fontWeight: 600 }}>
                    ✓ Saved to email history
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty" style={{ padding: "60px 20px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#EFF6FF",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Mail size={22} />
                </div>
                <b style={{ color: "#334155" }}>No email generated yet</b>
                <p style={{ marginTop: "4px", fontSize: "13px" }}>
                  Select a lead and click "Generate Email" to create a bespoke outreach message.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
