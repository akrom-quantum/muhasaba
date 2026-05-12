"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ICON_MAP } from "@/data/iconMap";
import { Sun, Moon, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

const NAV = [
  { href: "/today",    icon: "Sun",         label: "Today" },
  { href: "/muhasaba", icon: "BookOpen",    label: "Muhasaba" },
  { href: "/habits",   icon: "Target",      label: "Habits" },
  { href: "/tasks",    icon: "CheckSquare", label: "Tasks" },
  { href: "/settings", icon: "Layers",      label: "Settings" },
];

function NavLinks({ collapsed, onNav }) {
  const pathname = usePathname();
  return (
    <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
      {NAV.map(({ href, icon, label }) => {
        const Icon = ICON_MAP[icon];
        const active = pathname === href || (href !== "/today" && pathname.startsWith(href));
        return (
          <Link key={href} href={href} onClick={onNav}
            title={collapsed ? label : undefined}
            style={{
              display: "flex", alignItems: "center",
              gap: collapsed ? 0 : "0.75rem",
              padding: "0.6rem",
              justifyContent: "center",
              borderRadius: 8,
              background: active ? "var(--accent-dim)" : "transparent",
              color: active ? "var(--accent)" : "var(--muted)",
              fontWeight: active ? 600 : 400, fontSize: "0.875rem",
              transition: "background 0.15s, color 0.15s",
              whiteSpace: "nowrap", overflow: "hidden",
            }}>
            {Icon && <Icon size={16} style={{ flexShrink: 0 }} />}
            {!collapsed && <span style={{ marginLeft: "0.75rem" }}>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomBar({ collapsed, theme, toggleTheme, user }) {
  return (
    <div style={{ padding: collapsed ? "0.75rem 0.4rem" : "1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {!collapsed && user && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem", overflow: "hidden" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
            {user.email?.[0]?.toUpperCase()}
          </div>
          <span style={{ color: "var(--text-2)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </span>
        </div>
      )}
      <div style={{ display: "flex", gap: "0.35rem", flexDirection: collapsed ? "column" : "row" }}>
        <button onClick={toggleTheme}
          style={{ flex: 1, padding: "0.45rem", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, color: "var(--muted)", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        {!collapsed && user && (
          <button onClick={() => signOut(auth)}
            style={{ flex: 1, padding: "0.45rem", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, color: "var(--muted)", fontSize: "0.75rem" }}>
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const user = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Inject mobile styles — pushes main content below fixed top bar */}
      <style>{`
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-bar { display: flex !important; }
          main { padding-top: calc(56px + 1.25rem) !important; }
        }
        @media (min-width: 768px) {
          .sidebar-mobile-bar { display: none !important; }
        }
      `}</style>

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="sidebar-desktop" style={{
        width: collapsed ? 52 : 220,
        flexShrink: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        height: "100vh", position: "sticky", top: 0,
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}>
        <div style={{ padding: "1.25rem 0.75rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "0.5rem", flexShrink: 0 }}>
          {!collapsed && (
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>محاسبة</span>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 7, padding: "0.3rem", display: "flex", alignItems: "center", color: "var(--muted)", flexShrink: 0 }}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <NavLinks collapsed={collapsed} />
        <BottomBar collapsed={collapsed} theme={theme} toggleTheme={toggleTheme} user={user} />
      </aside>

      {/* ── Mobile top bar (fixed) ──────────────────────── */}
      <div className="sidebar-mobile-bar" style={{
        display: "none",
        position: "fixed", top: 0, left: 0, right: 0, height: 56,
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        alignItems: "center", padding: "0 1rem", zIndex: 100, gap: "0.75rem",
      }}>
        <button onClick={() => setMobileOpen(true)}
          style={{ background: "transparent", border: "none", color: "var(--muted)", display: "flex", padding: "0.25rem" }}>
          <Menu size={20} />
        </button>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent)" }}>محاسبة</span>
        <div style={{ flex: 1 }} />
        <button onClick={toggleTheme}
          style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 7, padding: "0.35rem", display: "flex", color: "var(--muted)" }}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────── */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 150 }} />
          <aside style={{
            position: "fixed", top: 0, left: 0, bottom: 0, width: 260,
            background: "var(--surface)", borderRight: "1px solid var(--border)",
            display: "flex", flexDirection: "column", zIndex: 200,
          }}>
            <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent)" }}>محاسبة</span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", display: "flex", padding: "0.25rem" }}>
                <X size={18} />
              </button>
            </div>
            <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV.map(({ href, icon, label }) => {
                const Icon = ICON_MAP[icon];
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.875rem",
                      padding: "0.75rem 1rem", borderRadius: 8,
                      color: "var(--muted)", fontWeight: 400, fontSize: "1rem",
                    }}>
                    {Icon && <Icon size={18} />}
                    {label}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 700, fontSize: "0.8rem" }}>
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ color: "var(--text-2)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
                </div>
                <button onClick={() => signOut(auth)}
                  style={{ width: "100%", padding: "0.5rem", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, color: "var(--muted)", fontSize: "0.85rem" }}>
                  Sign out
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
