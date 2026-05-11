"use client";
import { X } from "lucide-react";

const PRIORITIES = {
  high:   { label: "High", color: "#ef4444", bg: "#450a0a" },
  medium: { label: "Med",  color: "#f59e0b", bg: "#431407" },
  low:    { label: "Low",  color: "#6ee7b7", bg: "#064e3b" },
};

export default function TaskCard({ task, onToggle, onDelete }) {
  const p = PRIORITIES[task.priority] || PRIORITIES.medium;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", background: "var(--bg)", borderRadius: 8, border: `1px solid ${task.done ? "var(--border)" : "var(--border)"}`, marginBottom: "0.375rem", opacity: task.done ? 0.7 : 1 }}>
      <button onClick={() => onToggle(task.id, task.done)}
        style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: task.done ? "var(--accent)" : "transparent", border: `2px solid ${task.done ? "var(--accent)" : "var(--text-3)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
        {task.done && <span style={{ color: "#fff", fontSize: "0.6rem", fontWeight: 900 }}>✓</span>}
      </button>
      <span style={{ flex: 1, color: task.done ? "var(--muted)" : "var(--text-2)", fontSize: "0.875rem", textDecoration: task.done ? "line-through" : "none" }}>
        {task.text}
      </span>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: 4, background: p.bg, color: p.color, flexShrink: 0 }}>{p.label}</span>
      <button onClick={() => onDelete(task.id)} style={{ background: "transparent", border: "none", color: "var(--text-3)", display: "flex", alignItems: "center", flexShrink: 0 }}>
        <X size={13} />
      </button>
    </div>
  );
}
