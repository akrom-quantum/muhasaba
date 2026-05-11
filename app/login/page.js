"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useAuth();

  useEffect(() => {
    if (user) router.replace("/today");
  }, [user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/today");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace("/today");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  }

  if (user === undefined) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>محاسبة</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Personal accountability dashboard</p>
        </div>

        <div style={{ background: "var(--surface)", borderRadius: 16, padding: "2rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", marginBottom: "1.5rem", background: "var(--bg)", borderRadius: 8, padding: 4 }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: "none", background: mode === m ? "var(--accent)" : "transparent", color: mode === m ? "#fff" : "var(--muted)", fontWeight: mode === m ? 600 : 400, fontSize: "0.875rem", transition: "all 0.15s" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            </div>

            {error && (
              <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "var(--danger-surface)", border: "1px solid var(--danger-border)", borderRadius: 8, color: "var(--danger-text)", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "0.75rem", background: "var(--accent)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "1rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <button onClick={handleGoogle} disabled={loading}
            style={{ width: "100%", padding: "0.75rem", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontWeight: 500, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.6 6.4 6.3 14.7z"/>
              <path fill="#FBBC05" d="M24 46c5.9 0 10.9-2 14.5-5.4l-6.7-5.5C29.9 36.7 27.1 37.5 24 37.5c-6.1 0-11.2-4-13-9.5l-7 5.4C7.3 41.3 15 46 24 46z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.5-2.5 4.6-4.8 6.1l6.7 5.5C42 36.7 45 31 45 24c0-1.3-.2-2.7-.5-4z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", color: "var(--muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" };
const inputStyle = { width: "100%", padding: "0.75rem 1rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", outline: "none" };
