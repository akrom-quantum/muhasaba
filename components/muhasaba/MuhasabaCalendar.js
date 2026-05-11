"use client";
import { useState } from "react";
import { BookOpen, Mic, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

const TYPE_COLOR = { book: "#10b981", maviza: "#f59e0b", conversation: "#38bdf8" };
const TYPE_ICON  = { book: BookOpen,  maviza: Mic,       conversation: MessageCircle };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MuhasabaCalendar({ entries }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);
  const { year, month } = cursor;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = {};
  entries.forEach((e) => { if (!byDate[e.date]) byDate[e.date] = []; byDate[e.date].push(e); });

  function dateKey(d) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const monthName = new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" });
  const todayKey  = today.toISOString().slice(0, 10);
  const selectedEntries = selectedDay ? byDate[dateKey(selectedDay)] || [] : [];

  function prev() { setCursor(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }); setSelectedDay(null); }
  function next() { setCursor(month === 11 ? { year: year + 1, month: 0  } : { year, month: month + 1 }); setSelectedDay(null); }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <button onClick={prev} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 7, padding: "0.35rem 0.6rem", color: "var(--muted)", display: "flex", alignItems: "center" }}><ChevronLeft size={16} /></button>
        <span style={{ color: "var(--text)", fontWeight: 700, fontSize: "1rem" }}>{monthName}</span>
        <button onClick={next} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 7, padding: "0.35rem 0.6rem", color: "var(--muted)", display: "flex", alignItems: "center" }}><ChevronRight size={16} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.25rem" }}>
        {DAYS.map((d) => <div key={d} style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.7rem", fontWeight: 600, padding: "0.25rem 0" }}>{d}</div>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const key = dateKey(d);
          const dayEntries = byDate[key] || [];
          const isToday = key === todayKey;
          const isSelected = selectedDay === d;
          const types = [...new Set(dayEntries.map((e) => e.type))];
          return (
            <button key={d} onClick={() => setSelectedDay(isSelected ? null : d)}
              style={{ background: isSelected ? "var(--surface-2)" : "transparent", border: `1px solid ${isSelected ? "var(--muted)" : "transparent"}`, borderRadius: 8, padding: "0.4rem 0.2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", cursor: dayEntries.length ? "pointer" : "default", minHeight: 48 }}>
              <span style={{ fontSize: "0.8rem", fontWeight: isToday ? 700 : 400, color: isToday ? "var(--accent)" : dayEntries.length ? "var(--text)" : "var(--muted)", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: isToday ? "var(--accent-dim)" : "transparent" }}>{d}</span>
              {types.length > 0 && (
                <div style={{ display: "flex", gap: "0.2rem" }}>
                  {types.map((t) => <span key={t} style={{ width: 6, height: 6, borderRadius: "50%", background: TYPE_COLOR[t] || "var(--accent)" }} />)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
        {Object.entries(TYPE_COLOR).map(([type, color]) => {
          const Icon = TYPE_ICON[type];
          return (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <Icon size={11} color="var(--muted)" />
              <span style={{ color: "var(--muted)", fontSize: "0.72rem", textTransform: "capitalize" }}>{type}</span>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div style={{ marginTop: "1.25rem", background: "var(--bg)", borderRadius: 12, padding: "1rem", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            {new Date(year, month, selectedDay).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          {selectedEntries.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>No entries</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {selectedEntries.map((e) => {
                const color = TYPE_COLOR[e.type] || "var(--accent)";
                const Icon = TYPE_ICON[e.type] || BookOpen;
                return (
                  <div key={e.id} style={{ padding: "0.75rem", background: "var(--surface)", borderRadius: 8, borderLeft: `3px solid ${color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                      <Icon size={12} color={color} />
                      <span style={{ color, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>{e.type}</span>
                      {e.topic && <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>· {e.topic}</span>}
                    </div>
                    <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.875rem" }}>{e.title}</p>
                    <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>by {e.author}</p>
                    {e.notes && <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.375rem", lineHeight: 1.5 }}>{e.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
