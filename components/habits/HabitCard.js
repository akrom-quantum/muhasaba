"use client";
import { X } from "lucide-react";
import { ICON_MAP } from "@/data/iconMap";

export default function HabitCard({ habit, log, onToggle, onCountChange, onDelete }) {
  const Icon = ICON_MAP[habit.icon] || ICON_MAP["Star"];
  const done = log?.done || false;
  const value = log?.value || 0;
  const progress = habit.goalType === "count" ? Math.min(1, value / (habit.goalValue || 1)) : done ? 1 : 0;

  return (
    <div style={{ background: "var(--bg)", borderRadius: 10, padding: "0.875rem 1rem", border: `1px solid ${done ? habit.color + "55" : "var(--border)"}`, transition: "border-color 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: habit.color + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={habit.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: done ? "var(--text)" : "var(--text-2)", fontWeight: 600, fontSize: "0.875rem" }}>{habit.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {habit.streak > 0 && <span style={{ color: "#f97316", fontSize: "0.72rem", fontWeight: 700 }}>🔥 {habit.streak}</span>}
              {onDelete && (
                <button onClick={() => onDelete(habit.id)} style={{ background: "transparent", border: "none", color: "var(--text-3)", display: "flex", alignItems: "center", padding: "0.2rem" }}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
          {habit.goalType === "count" && (
            <>
              <div style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: "0.1rem" }}>{value} / {habit.goalValue} {habit.unit}</div>
              <div style={{ marginTop: "0.4rem", height: 3, background: "var(--border)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${progress * 100}%`, background: habit.color, borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </>
          )}
        </div>
        {habit.goalType === "boolean" ? (
          <button onClick={() => onToggle(habit)}
            style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: done ? habit.color : "transparent", border: `2px solid ${done ? habit.color : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            {done && <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 900 }}>✓</span>}
          </button>
        ) : (
          <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
            <button onClick={() => onCountChange(habit, -1)} style={{ width: 26, height: 26, borderRadius: 6, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <button onClick={() => onCountChange(habit, 1)} style={{ width: 26, height: 26, borderRadius: 6, background: done ? habit.color + "22" : "transparent", border: `1px solid ${done ? habit.color : "var(--border)"}`, color: done ? habit.color : "var(--muted)", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
