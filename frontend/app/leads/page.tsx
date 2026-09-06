"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";
import type { Lead } from "@/types";

export default function Leads() {
  const [data, setData] = useState<{ items: Lead[]; total: number } | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [industry, setIndustry] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    let url = `/leads?page=${page}&page_size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;
    if (industry) url += `&industry=${encodeURIComponent(industry)}`;

    api<{ items: Lead[]; total: number; page: number; page_size: number }>(url)
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, status, industry, page]);

  async function del(id: number) {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await api(`/leads/${id}`, { method: "DELETE" });
        load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to delete");
      }
    }
  }

  const getAvatarBg = (name: string) => {
    const colors = ["#2563EB", "#0D9488", "#7C3AED", "#DB2777", "#D97706", "#4F46E5"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // Mock items fallback if no database leads yet for demonstration
  const displayItems = data?.items && data.items.length > 0 ? data.items : [];
  const totalCount = data?.total ?? displayItems.length;

  return (
    <Shell>
      <div className="page">
        {/* Page Header */}
        <div className="pagehead">
          <div>
            <h1>Leads</h1>
            <p className="muted">Manage and track your sales leads.</p>
          </div>
          <Link className="btn" href="/leads/new">
            <Plus size={16} /> Add Lead
          </Link>
        </div>

        {/* Toolbar & Filter Controls */}
        <div className="toolbar">
          <div className="toolbar-left">
            <div
              className="control"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "300px",
                padding: "8px 12px",
              }}
            >
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search by name, company or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  border: 0,
                  outline: "none",
                  width: "100%",
                  fontSize: "13.5px",
                  color: "var(--text-main)",
                }}
              />
            </div>

            <select
              className="control"
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Industry: All</option>
              <option value="SaaS">SaaS</option>
              <option value="Fintech">Fintech</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Steel">Steel</option>
              <option value="EdTech">EdTech</option>
              <option value="E-commerce">E-commerce</option>
            </select>

            <select
              className="control"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Status: All</option>
              <option value="qualified">Qualified</option>
              <option value="review">Review</option>
              <option value="unqualified">Unqualified</option>
            </select>

            <select
              className="control"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
            >
              <option value="">AI Score: All</option>
              <option value="high">High (&gt; 75)</option>
              <option value="mid">Medium (50 - 75)</option>
              <option value="low">Low (&lt; 50)</option>
            </select>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Leads Table Card */}
        <div className="card" style={{ padding: 0 }}>
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
                  <th>Email</th>
                  <th>AI Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((lead) => {
                  const fullName = `${lead.first_name} ${lead.last_name}`;
                  const initials = `${lead.first_name[0] || ""}${lead.last_name[0] || ""}`.toUpperCase();
                  const qStatus = lead.qualification?.status;
                  const qScore = lead.qualification?.score;

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
                            >
                              {fullName}
                            </Link>
                            <div className="table-lead-sub">{lead.job_title || "Lead"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{lead.company}</td>
                      <td>{lead.industry || "—"}</td>
                      <td style={{ color: "#64748B" }}>{lead.email}</td>
                      <td>
                        {qScore !== undefined ? (
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
                            {qScore}
                          </span>
                        ) : (
                          <span style={{ color: "#94A3B8" }}>—</span>
                        )}
                      </td>
                      <td>
                        {qStatus ? (
                          <span className={`badge ${qStatus}`}>{qStatus}</span>
                        ) : (
                          <span style={{ color: "#94A3B8" }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <Link
                            href={`/leads/${lead.id}`}
                            className="btn-icon"
                            title="View lead"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => del(lead.id)}
                            className="btn-icon"
                            style={{ color: "#EF4444" }}
                            title="Delete lead"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && displayItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty">
                      No leads found matching your criteria.
                      <br />
                      <Link
                        className="btn"
                        style={{ marginTop: "14px", display: "inline-flex" }}
                        href="/leads/new"
                      >
                        + Add your first lead
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--border-card)",
              fontSize: "13px",
              color: "#64748B",
            }}
          >
            <span>
              Showing {displayItems.length ? 1 : 0} to {displayItems.length} of {totalCount} leads
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                className="btn-icon"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "var(--primary)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                {page}
              </span>
              <button
                type="button"
                className="btn-icon"
                disabled={displayItems.length < 10}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
