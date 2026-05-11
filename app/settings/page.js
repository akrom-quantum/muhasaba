"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import { Layers, LogOut, User, Shield } from "lucide-react";

const accent = "#10b981";
const bg = "#0f172a";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";

export default function SettingsPage() {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <div style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f1f5f9", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <Layers size={24} color={accent} /> Settings
          </h1>
          <p style={{ color: muted, fontSize: "0.875rem", marginBottom: "2rem" }}>Manage your account</p>

          {/* Account */}
          <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, marginBottom: "1.25rem", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${border}` }}>
              <p style={{ color: muted, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Account</p>
            </div>
            <div style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: accent + "22", display: "flex", alignItems: "center", justifyContent: "center", color: accent, fontWeight: 800, fontSize: "1.1rem", flexShrink: 0 }}>
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem" }}>{user.displayName || "User"}</p>
                  <p style={{ color: muted, fontSize: "0.85rem" }}>{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* App info */}
          <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, marginBottom: "1.25rem", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${border}` }}>
              <p style={{ color: muted, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>About</p>
            </div>
            {[
              { label: "App", value: "محاسبة · Muhasaba" },
              { label: "Version", value: "1.0.0" },
              { label: "Firebase project", value: "chashma-learn" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.25rem", borderBottom: `1px solid ${border}` }}>
                <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>{label}</span>
                <span style={{ color: muted, fontSize: "0.875rem" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Sign out */}
          <button onClick={() => signOut(auth).then(() => router.replace("/login"))}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "0.875rem 1.25rem", background: "#450a0a22", border: "1px solid #991b1b44", borderRadius: 12, color: "#ef4444", fontWeight: 600, fontSize: "0.9rem" }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
