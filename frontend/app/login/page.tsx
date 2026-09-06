"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@leadpilot.dev");
  const [password, setPassword] = useState("LeadPilot123!");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister ? { name, email, password } : { email, password };
      const res = await api<{ access_token: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      localStorage.setItem("leadpilot_token", res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authenticate");
    } finally {
      setLoading(false);
    }
  }

  const fillDemo = () => {
    setIsRegister(false);
    setEmail("demo@leadpilot.dev");
    setPassword("LeadPilot123!");
  };

  return (
    <main className="login-container">
      {/* Left Form Section */}
      <section className="login-pane-left">
        <div>
          <div className="login-brand-tag">
            <div className="login-brand-icon">
              <Layers size={18} strokeWidth={2.5} />
            </div>
            <span className="login-brand-title">LeadPilot</span>
            <span className="login-brand-badge">AI SDR Platform</span>
          </div>

          <h1 className="login-title">
            {isRegister ? "Create your SDR account" : "Sign in to your account"}
          </h1>
          <p className="login-subtitle">
            {isRegister
              ? "Set up your workspace to automate prospect qualification and outreach."
              : "Access your leads, AI insights, and outreach tools."}
          </p>

          <form onSubmit={submit}>
            {error && <div className="error">{error}</div>}

            {isRegister && (
              <div className="login-form-group">
                <label>Full Name</label>
                <div className="login-input-wrap">
                  <User size={16} className="login-input-icon" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="login-input"
                  />
                </div>
              </div>
            )}

            <div className="login-form-group">
              <label>Work Email</label>
              <div className="login-input-wrap">
                <Mail size={16} className="login-input-icon" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="login-input"
                />
              </div>
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" />
                <input
                  required
                  minLength={8}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "Minimum 8 characters" : "Enter your password"}
                  className="login-input"
                />
              </div>
            </div>

            {!isRegister && (
              <div className="login-options-row">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={fillDemo}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Fill Demo Credentials
                </button>
              </div>
            )}

            <button
              className="btn"
              style={{ width: "100%", height: "42px", fontSize: "14px", marginTop: isRegister ? "16px" : "0" }}
              disabled={loading}
              type="submit"
            >
              {loading
                ? isRegister
                  ? "Creating account…"
                  : "Signing in…"
                : isRegister
                ? "Create Account"
                : "Sign in"}
            </button>

            <div className="divider-row">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={() => alert("Google SSO is available in enterprise editions.")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="login-footer-hint">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegister(false);
                    setError("");
                  }}
                  style={{ fontWeight: 600, color: "var(--primary)" }}
                >
                  Sign in
                </a>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegister(true);
                    setError("");
                  }}
                  style={{ fontWeight: 600, color: "var(--primary)" }}
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Right Hero Section with Building Background */}
      <section className="login-pane-right">
        <div />

        <div className="login-hero-content">
          <h2 className="login-hero-title">Turn leads into opportunities</h2>
          <p className="login-hero-desc">
            Use OpenAI to qualify ICP fit and Google Gemini to generate high-converting personalized outreach at scale.
          </p>

          <div
            style={{
              width: "36px",
              height: "2px",
              background: "rgba(255, 255, 255, 0.25)",
              margin: "24px 0",
              borderRadius: "2px",
            }}
          />

          <div className="login-features-list">
            <div className="login-feature-item">
              <div className="login-feature-check">
                <CheckCircle2 size={16} />
              </div>
              <span>OpenAI-powered Lead Scoring</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-check">
                <CheckCircle2 size={16} />
              </div>
              <span>Gemini Personalized Email Drafts</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-check">
                <CheckCircle2 size={16} />
              </div>
              <span>PostgreSQL Enterprise Data Storage</span>
            </div>
          </div>
        </div>

        <div className="login-quote-text">
          “Good conversations create great businesses.”
        </div>
      </section>
    </main>
  );
}
