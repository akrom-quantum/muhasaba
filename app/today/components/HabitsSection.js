"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const accent = "#10b981";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";
const bg = "#0f172a";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const PRESET_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

// Subset of Lucide icon names with SVG paths
const ICONS = {
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  droplets: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
  dumbbell: "M6.5 6.5h11M17.5 6.5v11M6.5 17.5h11M6.5 6.5v11",
  pen: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  clock: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2",
  target: "M22 12A10 10 0 1 1 12 2M22 12a10 10 0 0 1-10 10M15 12a3 3 0 1 1-3-3M15 12a3 3 0 0 1-3 3M22 12h-5",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
};

const ICON_NAMES = Object.keys(ICONS);

function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ padding: "0.4rem 0.75rem", background: bg, border: `1px solid ${border}`, borderRadius: 6, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
        <SvgIcon name={value} size={14} color={accent} />
        <span>{value}</span>
        <span style={{ color: muted }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100, background: "#1e293b", border: `1px solid ${border}`, borderRadius: 10, padding: "0.75rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", width: 220 }}>
          {ICON_NAMES.map((name) => (
            <button key={name} type="button" onClick={() => { onChange(name); setOpen(false); }}
              title={name}
              style={{ padding: "0.5rem", background: value === name ? "#064e3b" : "transparent", border: `1px solid ${value === name ? accent : "transparent"}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SvgIcon name={name} size={16} color={value === name ? accent : muted} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
      {PRESET_COLORS.map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)}
          style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: value === c ? "2px solid #fff" : "2px solid transparent", outline: "none", padding: 0 }} />
      ))}
    </div>
  );
}

function SvgIcon({ name, size = 16, color = "currentColor" }) {
  const d = ICONS[name] || ICONS.star;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const emptyForm = { name: "", icon: "star", color: "#10b981", goalType: "boolean", goalValue: 1, unit: "" };

export default function HabitsSection({ uid }) {
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const habitsCol = collection(db, "users", uid, "habits");

  useEffect(() => {
    const q = query(habitsCol, orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      setHabits(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [uid]);

  useEffect(() => {
    if (habits.length === 0) return;
    const today = todayKey();
    const unsubs = habits.map((h) => {
      const logRef = doc(db, "users", uid, "habits", h.id, "logs", today);
      return onSnapshot(logRef, (snap) => {
        setTodayLogs((prev) => ({ ...prev, [h.id]: snap.exists() ? snap.data() : null }));
      });
    });
    return () => unsubs.forEach((u) => u());
  }, [habits, uid]);

  async function handleAddHabit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await addDoc(habitsCol, { ...form, goalValue: Number(form.goalValue) || 1, createdAt: serverTimestamp() });
      setForm(emptyForm);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function toggleHabit(habitId, habit) {
    const today = todayKey();
    const logRef = doc(db, "users", uid, "habits", habitId, "logs", today);
    const existing = todayLogs[habitId];
    if (habit.goalType === "boolean") {
      if (existing?.done) {
        await setDoc(logRef, { done: false, value: 0, date: today });
      } else {
        await setDoc(logRef, { done: true, value: 1, date: today });
        await updateStreak(habitId);
      }
    }
  }

  async function updateHabitValue(habitId, delta, habit) {
    const today = todayKey();
    const logRef = doc(db, "users", uid, "habits", habitId, "logs", today);
    const existing = todayLogs[habitId];
    const current = existing?.value || 0;
    const newVal = Math.max(0, current + delta);
    const done = newVal >= (habit.goalValue || 1);
    await setDoc(logRef, { done, value: newVal, date: today });
    if (done && !existing?.done) await updateStreak(habitId);
  }

  async function updateStreak(habitId) {
    const habitRef = doc(db, "users", uid, "habits", habitId);
    const snap = await getDoc(habitRef);
    if (!snap.exists()) return;
    const d = snap.data();
    const lastDate = d.lastCompletedDate;
    const today = todayKey();
    if (lastDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const newStreak = lastDate === yKey ? (d.streak || 0) + 1 : 1;
    const bestStreak = Math.max(d.bestStreak || 0, newStreak);
    await updateDoc(habitRef, { streak: newStreak, bestStreak, lastCompletedDate: today });
  }

  async function deleteHabit(id) {
    await deleteDoc(doc(db, "users", uid, "habits", id));
  }

  return (
    <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>🔥</span> Habits
        </h2>
        <button onClick={() => setOpen(!open)} style={{ padding: "0.4rem 0.9rem", background: open ? "transparent" : accent, border: `1px solid ${open ? border : accent}`, borderRadius: 8, color: open ? muted : "#fff", fontSize: "0.8rem", fontWeight: 600 }}>
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleAddHabit} style={{ marginBottom: "1.25rem", background: bg, borderRadius: 12, padding: "1.25rem", border: `1px solid ${border}` }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>Habit Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder="e.g. Morning walk" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Icon</label>
              <IconPicker value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
            </div>
            <div>
              <label style={labelStyle}>Goal Type</label>
              <select value={form.goalType} onChange={(e) => setForm({ ...form, goalType: e.target.value })} style={inputStyle}>
                <option value="boolean">Done / Not done</option>
                <option value="count">Count</option>
              </select>
            </div>
          </div>
          {form.goalType === "count" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Goal Value</label>
                <input type="number" min="1" value={form.goalValue} onChange={(e) => setForm({ ...form, goalValue: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pages, mins…" style={inputStyle} />
              </div>
            </div>
          )}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Color</label>
            <ColorPicker value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
          </div>
          <button type="submit" disabled={saving} style={{ padding: "0.5rem 1.25rem", background: accent, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.875rem", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Add Habit"}
          </button>
        </form>
      )}

      {habits.length === 0 ? (
        <p style={{ color: muted, fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>No habits yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {habits.map((h) => {
            const log = todayLogs[h.id];
            const done = log?.done || false;
            const value = log?.value || 0;
            const progress = h.goalType === "count" ? Math.min(1, value / (h.goalValue || 1)) : done ? 1 : 0;
            return (
              <div key={h.id} style={{ background: bg, borderRadius: 10, padding: "0.875rem 1rem", border: `1px solid ${done ? h.color + "44" : border}`, transition: "border-color 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: h.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <SvgIcon name={h.icon} size={16} color={h.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: done ? "#f1f5f9" : "#cbd5e1", fontWeight: 600, fontSize: "0.875rem" }}>{h.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {h.streak > 0 && (
                          <span style={{ color: "#f97316", fontSize: "0.75rem", fontWeight: 700 }}>🔥{h.streak}</span>
                        )}
                        <button onClick={() => deleteHabit(h.id)} style={{ background: "transparent", border: "none", color: "#475569", fontSize: "0.8rem", lineHeight: 1, padding: "0.2rem" }}>✕</button>
                      </div>
                    </div>
                    {h.goalType === "count" && (
                      <div style={{ fontSize: "0.75rem", color: muted, marginTop: "0.125rem" }}>
                        {value} / {h.goalValue} {h.unit}
                      </div>
                    )}
                    {h.goalType === "count" && (
                      <div style={{ marginTop: "0.4rem", height: 4, background: "#334155", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress * 100}%`, background: h.color, borderRadius: 2, transition: "width 0.3s" }} />
                      </div>
                    )}
                  </div>
                  {h.goalType === "boolean" ? (
                    <button onClick={() => toggleHabit(h.id, h)}
                      style={{ width: 28, height: 28, borderRadius: "50%", background: done ? h.color : "transparent", border: `2px solid ${done ? h.color : border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                      {done && <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>✓</span>}
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                      <button onClick={() => updateHabitValue(h.id, -1, h)} style={{ width: 26, height: 26, borderRadius: 6, background: "transparent", border: `1px solid ${border}`, color: muted, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <button onClick={() => updateHabitValue(h.id, 1, h)} style={{ width: 26, height: 26, borderRadius: 6, background: done ? h.color + "33" : "transparent", border: `1px solid ${done ? h.color : border}`, color: done ? h.color : muted, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  color: muted,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.375rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  background: "#1e293b",
  border: `1px solid ${border}`,
  borderRadius: 6,
  color: "#f1f5f9",
  fontSize: "0.875rem",
  outline: "none",
};
