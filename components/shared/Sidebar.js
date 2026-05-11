"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ICON_MAP } from "@/data/iconMap";
import { Sun, Moon } from "lucide-react";

const NAV = [
  { href: "/today",    icon: "Sun",         label: "Today" },
  { href: "/muhasaba", icon: "BookOpen",    label: "Muhasaba" },
  { href: "/habits",   icon: "Target",      label: "Habits" },
  { href: "/tasks",    icon: "CheckSquare", label: "Tasks" },
  { href: "/settings", icon: "Layers",      label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em" }}>محاسبة</span>
        <button onClick={toggleTheme}
          style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 7, padding: "0.35rem", display: "flex", alignItems: "center", color: "var(--muted)" }}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, icon, label }) => {
          const Icon = ICON_MAP[icon];
          const active = pathname === href || (href !== "/today" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.6rem 0.875rem", borderRadius: 8,
              background: active ? "var(--accent-dim)" : "transparent",
              color: active ? "var(--accent)" : "var(--muted)",
              fontWeight: active ? 600 : 400, fontSize: "0.875rem",
              transition: "all 0.15s",
            }}>
              {Icon && <Icon size={16} />}
              {label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
              {user.email?.[0]?.toUpperCase()}
            </div>
            <span style={{ color: "var(--text-2)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </span>
          </div>
          <button onClick={() => signOut(auth)}
            style={{ width: "100%", padding: "0.45rem", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, color: "var(--muted)", fontSize: "0.75rem" }}>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
