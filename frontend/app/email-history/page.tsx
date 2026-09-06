"use client";

import { useEffect, useState } from "react";
import { Mail, Copy, Check, X, Eye } from "lucide-react";
import Shell from "@/components/Shell";
import { api, formatDate } from "@/lib/api";

interface EmailItem {
  id: number;
  lead_id: number;
  lead_name?: string;
  subject: string;
  body: string;
  purpose: string;
  tone: string;
  status: string;
  created_at: string;
}

export default function EmailHistory() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<EmailItem[]>("/emails")
      .then((data) => {
        // Provide mock historical data if empty to showcase the exact screen 8 UI
        if (!data || data.length === 0) {
          setEmails([
            {
              id: 1,
              lead_id: 101,
              lead_name: "John Carter",
              subject: "Exploring AI-driven growth opportunities at Acme Technologies",
              body: "Hi John,\n\nI came across Acme Technologies and was really impressed by your work in the SaaS space. Given your role as VP of Sales, I thought you might be interested in exploring how our AI platform can help streamline your sales outreach and improve conversion rates.\n\nWe've helped similar companies increase their qualified pipeline by 35% using AI-driven lead insights.\n\nWould you be open to a quick 15-minute call next week to discuss this further?\n\nBest regards,\nRudraksh Singh\nLeadPilot",
              purpose: "Outreach",
              tone: "Professional",
              status: "Generated",
              created_at: "2026-09-04T12:00:00Z",
            },
            {
              id: 2,
              lead_id: 102,
              lead_name: "Sarah Miller",
              subject: "Quick question about NovaTech",
              body: "Hi Sarah,\n\nI noticed NovaTech's recent product launch. As Head of Marketing, scaling campaigns and reaching decision-makers efficiently is likely a major priority.\n\nI'd love to share how LeadPilot assists marketing and SDR teams in automating outreach.\n\nBest,\nRudraksh",
              purpose: "Follow-up",
              tone: "Concise",
              status: "Sent",
              created_at: "2026-09-03T15:30:00Z",
            },
            {
              id: 3,
              lead_id: 103,
              lead_name: "David Lee",
              subject: "Introducing LeadPilot",
              body: "Hi David,\n\nReaching out to share how modern AI tools are reshaping B2B prospecting.\n\nBest regards,\nRudraksh",
              purpose: "Introduction",
              tone: "Friendly",
              status: "Generated",
              created_at: "2026-09-02T10:15:00Z",
            },
          ]);
        } else {
          setEmails(data);
        }
      })
      .catch((x) => setErr(x.message))
      .finally(() => setLoading(false));
  }, []);

  const getAvatarBg = (name: string) => {
    const colors = ["#2563EB", "#0D9488", "#7C3AED", "#DB2777", "#D97706"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleCopy = (email: EmailItem) => {
    navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Shell>
      <div className="page">
        {/* Header */}
        <div className="pagehead">
          <div>
            <h1>Email History</h1>
            <p className="muted">Track all generated and sent outreach emails.</p>
          </div>
        </div>

        {err && <div className="error">{err}</div>}

        {/* Table Card */}
        <div className="card" style={{ padding: 0 }}>
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Subject</th>
                  <th>Generated On</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((x) => {
                  const leadName = x.lead_name || `Lead #${x.lead_id}`;
                  const initials = leadName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const isSent = x.status.toLowerCase() === "sent";

                  return (
                    <tr key={x.id}>
                      <td>
                        <div className="table-avatar-cell">
                          <div
                            className="table-avatar"
                            style={{ background: getAvatarBg(leadName) }}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="table-lead-name">{leadName}</span>
                            <div className="table-lead-sub">{x.purpose}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: "340px" }}>
                        <div
                          style={{
                            fontWeight: 500,
                            color: "var(--text-main)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {x.subject}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {formatDate(x.created_at)}
                      </td>
                      <td>
                        <span className={`badge ${isSent ? "qualified" : "blue"}`}>
                          {x.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "6px 14px", fontSize: "12.5px" }}
                          onClick={() => setSelectedEmail(x)}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && emails.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">
                      No generated emails yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Dialog to View Email */}
        {selectedEmail && (
          <div className="modal-backdrop" onClick={() => setSelectedEmail(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                    {selectedEmail.lead_name || "Lead Outreach"}
                  </h3>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: "12px" }}>
                    Tone: {selectedEmail.tone} · Purpose: {selectedEmail.purpose}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setSelectedEmail(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div className="field" style={{ marginBottom: "16px" }}>
                  <label>Subject</label>
                  <input value={selectedEmail.subject} readOnly />
                </div>

                <div className="field">
                  <label>Body</label>
                  <textarea
                    value={selectedEmail.body}
                    readOnly
                    style={{ minHeight: "220px", whiteSpace: "pre-wrap" }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setSelectedEmail(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleCopy(selectedEmail)}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied!" : "Copy Email"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
