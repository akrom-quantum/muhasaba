"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TaskCalendar({ tasks, selectedDate, onSelectDate }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const { year, month } = cursor;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = today.toISOString().slice(0, 10);
  const monthName = new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" });

  function dateKey(d) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function prev() {
    setCursor(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
    onSelectDate(null);
  }
  function next() {
    setCursor(month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
    onSelectDate(null);
  }

  const byDate = {};
  tasks.forEach((t) => {
    if (!byDate[t.date]) byDate[t.date] = { total: 0, done: 0 };
    byDate[t.date].total++;
    if (t.done) byDate[t.date].done++;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <button onClick={prev} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 7, padding: "0.35rem 0.6rem", color: "var(--muted)", display: "flex", alignItems: "center" }}>
          <ChevronLeft size={15} />
        </button>
        <span style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.95rem" }}>{monthName}</span>
        <button onClick={next} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 7, padding: "0.35rem 0.6rem", color: "var(--muted)", display: "flex", alignItems: "center" }}>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.2rem", marginBottom: "0.2rem" }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.65rem", fontWeight: 600, padding: "0.2rem 0" }}>{d[0]}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.2rem" }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const key = dateKey(d);
          const info = byDate[key];
          const isToday = key === todayKey;
          const isSelected = selectedDate === key;
          const allDone = info && info.done === info.total;
          const someDone = info && info.done > 0 && info.done < info.total;
          const noneDone = info && info.done === 0;
          const isPast = key < todayKey;

          let dotColor = null;
          if (info) {
            if (allDone) dotColor = "var(--accent)";
            else if (someDone) dotColor = "#f59e0b";
            else if (noneDone && isPast) dotColor = "var(--danger)";
            else dotColor = "var(--muted)";
          }

          return (
            <button key={d}
              onClick={() => onSelectDate(isSelected ? null : key)}
              style={{
                background: isSelected ? "var(--accent-dim)" : isToday ? "var(--surface-2)" : "transparent",
                border: `1px solid ${isSelected ? "var(--accent)" : isToday ? "var(--border)" : "transparent"}`,
                borderRadius: 8, padding: "0.3rem 0.1rem",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                cursor: "pointer", minHeight: 44,
              }}>
              <span style={{
                fontSize: "0.78rem",
                fontWeight: isToday ? 800 : 400,
                color: isToday ? "var(--accent)" : info ? "var(--text)" : "var(--muted)",
                width: 22, height: 22,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "50%",
              }}>{d}</span>
              {dotColor && (
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
        {[
          { color: "var(--accent)", label: "All done" },
          { color: "#f59e0b",       label: "Partial" },
          { color: "var(--danger)", label: "Overdue" },
          { color: "var(--muted)", label: "Pending" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ color: "var(--muted)", fontSize: "0.68rem" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
