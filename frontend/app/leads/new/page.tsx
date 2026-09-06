"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";

export default function NewLead() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    job_title: "",
    industry: "SaaS",
    company_size: "51 - 200",
    website: "",
    location: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api<{ id: number }>("/leads", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push(`/leads/${res.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create lead");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell>
      <div className="page" style={{ maxWidth: "880px" }}>
        {/* Back Link & Header */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            href="/leads"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-muted)",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "12px",
            }}
          >
            <ArrowLeft size={15} /> Back to Leads
          </Link>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>
            Add New Lead
          </h1>
          <p className="muted">Enter the details to create a new lead.</p>
        </div>

        {error && <div className="error">{error}</div>}

        <form className="card" onSubmit={submit} style={{ padding: "28px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#0F172A",
              marginBottom: "20px",
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: "12px",
            }}
          >
            Basic Information
          </h3>

          <div className="formgrid">
            <div className="field">
              <label>
                First Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                required
                type="text"
                value={form.first_name}
                onChange={(e) => change("first_name", e.target.value)}
                placeholder="John"
              />
            </div>

            <div className="field">
              <label>
                Last Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                required
                type="text"
                value={form.last_name}
                onChange={(e) => change("last_name", e.target.value)}
                placeholder="Carter"
              />
            </div>

            <div className="field">
              <label>
                Work Email <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => change("email", e.target.value)}
                placeholder="john@acme.com"
              />
            </div>

            <div className="field">
              <label>
                Company <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                required
                type="text"
                value={form.company}
                onChange={(e) => change("company", e.target.value)}
                placeholder="Acme Technologies"
              />
            </div>

            <div className="field">
              <label>Job Title</label>
              <input
                type="text"
                value={form.job_title}
                onChange={(e) => change("job_title", e.target.value)}
                placeholder="VP of Sales"
              />
            </div>

            <div className="field">
              <label>Industry</label>
              <select
                value={form.industry}
                onChange={(e) => change("industry", e.target.value)}
              >
                <option value="SaaS">SaaS</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Steel">Steel</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="EdTech">EdTech</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Professional Services">Professional Services</option>
              </select>
            </div>

            <div className="field">
              <label>Company Size</label>
              <select
                value={form.company_size}
                onChange={(e) => change("company_size", e.target.value)}
              >
                <option value="1 - 10">1 - 10 employees</option>
                <option value="11 - 50">11 - 50 employees</option>
                <option value="51 - 200">51 - 200 employees</option>
                <option value="201 - 500">201 - 500 employees</option>
                <option value="501 - 1000">501 - 1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div className="field">
              <label>Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => change("website", e.target.value)}
                placeholder="https://acme.com"
              />
            </div>

            <div className="field" style={{ gridColumn: "span 2" }}>
              <label>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => change("location", e.target.value)}
                placeholder="San Francisco, USA"
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: "18px" }}>
            <label>Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => change("notes", e.target.value)}
              placeholder="Add any additional context, meeting notes, or specific SDR insights..."
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <button
              type="button"
              className="btn secondary"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button className="btn" disabled={saving} type="submit">
              <UserPlus size={16} />
              {saving ? "Creating…" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
