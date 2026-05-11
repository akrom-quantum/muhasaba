"use client";
import { useState } from "react";
import { ICON_GROUPS, ICON_MAP } from "@/data/iconMap";

export default function IconPicker({ value, color = "var(--accent)", onChange }) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(ICON_GROUPS[0].label);

  const SelectedIcon = ICON_MAP[value] || ICON_MAP["Star"];
  const groupIcons = ICON_GROUPS.find((g) => g.label === activeGroup)?.icons ?? [];

  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.75rem", background: "var(--bg)", border: `1px solid ${open ? color : "var(--border)"}`, borderRadius: 7, color: "var(--text)", fontSize: "0.8rem", cursor: "pointer" }}>
        <SelectedIcon size={14} color={color} />
        <span>{value}</span>
        <span style={{ color: "var(--muted)", fontSize: "0.65rem" }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.875rem", width: 280, boxShadow: "0 8px 32px #0006" }}>
          <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            {ICON_GROUPS.map((g) => (
              <button key={g.label} type="button" onClick={() => setActiveGroup(g.label)}
                style={{ padding: "0.2rem 0.6rem", borderRadius: 20, border: "none", fontSize: "0.7rem", background: activeGroup === g.label ? color + "33" : "transparent", color: activeGroup === g.label ? color : "var(--muted)", fontWeight: activeGroup === g.label ? 700 : 400, cursor: "pointer" }}>
                {g.label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.35rem" }}>
            {groupIcons.map((name) => {
              const Icon = ICON_MAP[name];
              if (!Icon) return null;
              const active = value === name;
              return (
                <button key={name} type="button" title={name} onClick={() => { onChange(name); setOpen(false); }}
                  style={{ padding: "0.45rem", borderRadius: 7, background: active ? color + "22" : "transparent", border: `1px solid ${active ? color : "transparent"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Icon size={16} color={active ? color : "var(--muted)"} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
