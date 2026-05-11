"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, onSnapshot, updateDoc, deleteDoc, collection, query, orderBy, getDocs, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import ColorPicker from "@/components/habits/ColorPicker";
import IconPicker from "@/components/habits/IconPicker";
import { ICON_MAP } from "@/data/iconMap";
import { Flame, Trophy, ChevronLeft, Target, Pencil, Trash2, Check } from "lucide-react";
import Link from "next/link";

const accent = "#10b981";
const bg = "#0f172a";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLast90Days() {
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function HabitDetailPage() {
  const user = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState({});
  const [todayLog, setTodayLog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user || !id) return;
    return onSnapshot(doc(db, "users", user.uid, "habits", id), (snap) => {
      if (!snap.exists()) { router.replace("/habits"); return; }
      const data = { id: snap.id, ...snap.data() };
      setHabit(data);
      setEditForm(data);
    });
  }, [user, id]);

  useEffect(() => {
    if (!user || !id) return;
    return onSnapshot(doc(db, "users", user.uid, "habits", id, "logs", todayKey()), (snap) => {
      setTodayLog(snap.exists() ? snap.data() : null);
    });
  }, [user, id]);

  // Load last 90 days of logs
  useEffect(() => {
    if (!user || !id) return;
    async function loadLogs() {
      const col = collection(db, "users", user.uid, "habits", id, "logs");
      const snap = await getDocs(col);
      const map = {};
      snap.docs.forEach((d) => { map[d.id] = d.data(); });
      setLogs(map);
    }
    loadLogs();
  }, [user, id]);

  async function handleToggleToday() {
    if (!habit) return;
    const today = todayKey();
    const logRef = doc(db, "users", user.uid, "habits", id, "logs", today);
    if (todayLog?.done) {
      await setDoc(logRef, { done: false, value: 0, date: today });
    } else {
      await setDoc(logRef, { done: true, value: habit.goalType === "boolean" ? 1 : (habit.goalValue || 1), date: today });
      await updateStreak();
    }
  }

  async function handleCountChange(delta) {
    if (!habit) return;
    const today = todayKey();
    const logRef = doc(db, "users", user.uid, "habits", id, "logs", today);
    const current = todayLog?.value || 0;
    const newVal = Math.max(0, current + delta);
    const done = newVal >= (habit.goalValue || 1);
    await setDoc(logRef, { done, value: newVal, date: today });
    if (done && !todayLog?.done) await updateStreak();
  }

  async function updateStreak() {
    const habitRef = doc(db, "users", user.uid, "habits", id);
    const snap = await getDoc(habitRef);
    if (!snap.exists()) return;
    const d = snap.data();
    const today = todayKey();
    if (d.lastCompletedDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const newStreak = d.lastCompletedDate === yKey ? (d.streak || 0) + 1 : 1;
    const bestStreak = Math.max(d.bestStreak || 0, newStreak);
    await updateDoc(habitRef, { streak: newStreak, bestStreak, lastCompletedDate: today });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { id: _id, createdAt, streak, bestStreak, lastCompletedDate, ...fields } = editForm;
      await updateDoc(doc(db, "users", user.uid, "habits", id), { ...fields, goalValue: Number(fields.goalValue) || 1 });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await deleteDoc(doc(db, "users", user.uid, "habits", id));
    router.replace("/habits");
  }

  if (!user || !habit) return null;

  const Icon = ICON_MAP[habit.icon] || ICON_MAP["Star"];
  const done = todayLog?.done || false;
  const value = todayLog?.value || 0;
  const days90 = getLast90Days();
  const completedDays = days90.filter((d) => logs[d]?.done).length;
  const consistency = days90.length ? Math.round((completedDays / days90.length) * 100) : 0;

  // Group 90 days into weeks of 7
  const weeks = [];
  for (let i = 0; i < days90.length; i += 7) weeks.push(days90.slice(i, i + 7));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {/* Back */}
        <Link href="/habits" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: muted, fontSize: "0.85rem", marginBottom: "1.5rem", textDecoration: "none" }}>
          <ChevronLeft size={15} /> Habits
        </Link>

        {/* Habit header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: habit.color + "1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={24} color={habit.color} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", marginBottom: "0.125rem" }}>{habit.name}</h1>
            <p style={{ color: muted, fontSize: "0.85rem" }}>
              {habit.goalType === "boolean" ? "Daily habit" : `${habit.goalValue} ${habit.unit} / day`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setEditing(!editing); setEditForm(habit); }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.875rem", background: editing ? accent + "22" : surface, border: `1px solid ${editing ? accent : border}`, borderRadius: 8, color: editing ? accent : muted, fontSize: "0.8rem" }}>
              <Pencil size={13} /> Edit
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.875rem", background: surface, border: `1px solid ${border}`, borderRadius: 8, color: muted, fontSize: "0.8rem" }}>
                <Trash2 size={13} /> Delete
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.375rem" }}>
                <button onClick={handleDelete}
                  style={{ padding: "0.5rem 0.875rem", background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, color: "#ef4444", fontSize: "0.8rem", fontWeight: 700 }}>
                  Confirm
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ padding: "0.5rem 0.875rem", background: surface, border: `1px solid ${border}`, borderRadius: 8, color: muted, fontSize: "0.8rem" }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit form */}
        {editing && editForm && (
          <form onSubmit={handleSaveEdit} style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}`, marginBottom: "1.5rem" }}>
            <div style={{ marginBottom: "0.875rem" }}>
              <label style={labelStyle}>Name</label>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
              <div>
                <label style={labelStyle}>Icon</label>
                <IconPicker value={editForm.icon} color={editForm.color} onChange={(v) => setEditForm({ ...editForm, icon: v })} />
              </div>
              <div>
                <label style={labelStyle}>Goal Type</label>
                <select value={editForm.goalType} onChange={(e) => setEditForm({ ...editForm, goalType: e.target.value })} style={inputStyle}>
                  <option value="boolean">Done / Not done</option>
                  <option value="count">Count</option>
                </select>
              </div>
            </div>
            {editForm.goalType === "count" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Goal</label>
                  <input type="number" min="1" value={editForm.goalValue} onChange={(e) => setEditForm({ ...editForm, goalValue: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Unit</label>
                  <input value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} style={inputStyle} />
                </div>
              </div>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Color</label>
              <ColorPicker value={editForm.color} onChange={(v) => setEditForm({ ...editForm, color: v })} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" disabled={saving}
                style={{ padding: "0.5rem 1.25rem", background: editForm.color, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Check size={14} /> {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                style={{ padding: "0.5rem 1rem", background: "transparent", border: `1px solid ${border}`, borderRadius: 8, color: muted, fontSize: "0.875rem" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Today card */}
            <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${done ? habit.color + "44" : border}` }}>
              <p style={{ color: muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Today</p>
              {habit.goalType === "boolean" ? (
                <button onClick={handleToggleToday}
                  style={{ width: "100%", padding: "0.875rem", borderRadius: 10, background: done ? habit.color : "transparent", border: `2px solid ${done ? habit.color : border}`, color: done ? "#fff" : muted, fontWeight: 700, fontSize: "1rem", transition: "all 0.2s" }}>
                  {done ? "✓ Done" : "Mark as done"}
                </button>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.875rem" }}>
                    <button onClick={() => handleCountChange(-1)}
                      style={{ width: 40, height: 40, borderRadius: "50%", background: "transparent", border: `1px solid ${border}`, color: muted, fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "2rem", fontWeight: 800, color: done ? habit.color : "#f1f5f9" }}>{value}</span>
                      <span style={{ color: muted, fontSize: "0.875rem" }}> / {habit.goalValue} {habit.unit}</span>
                    </div>
                    <button onClick={() => handleCountChange(1)}
                      style={{ width: 40, height: 40, borderRadius: "50%", background: done ? habit.color + "22" : "transparent", border: `1px solid ${done ? habit.color : border}`, color: done ? habit.color : muted, fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                  <div style={{ height: 6, background: border, borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (value / (habit.goalValue || 1)) * 100)}%`, background: habit.color, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Streak", value: habit.streak || 0, icon: <Flame size={16} color="#f97316" />, color: "#f97316", suffix: "days" },
                { label: "Best", value: habit.bestStreak || 0, icon: <Trophy size={16} color="#f59e0b" />, color: "#f59e0b", suffix: "days" },
                { label: "Completed", value: completedDays, icon: <Check size={16} color={accent} />, color: accent, suffix: "days" },
                { label: "Consistency", value: `${consistency}%`, icon: <Target size={16} color="#8b5cf6" />, color: "#8b5cf6", suffix: "" },
              ].map(({ label, value: val, icon, color, suffix }) => (
                <div key={label} style={{ background: surface, borderRadius: 12, padding: "1rem", border: `1px solid ${border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.375rem" }}>
                    {icon}
                    <span style={{ color: muted, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                  </div>
                  <span style={{ color, fontSize: "1.4rem", fontWeight: 800 }}>{val}</span>
                  {suffix && <span style={{ color: muted, fontSize: "0.75rem" }}> {suffix}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right column — heatmap */}
          <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
            <p style={{ color: muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
              Last 90 days
            </p>
            <div style={{ display: "flex", gap: "3px" }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {week.map((day) => {
                    const log = logs[day];
                    const isToday = day === todayKey();
                    const isDone = log?.done;
                    const isPartial = log && !log.done && (log.value || 0) > 0;
                    let cellBg = "#1e293b";
                    if (isDone) cellBg = habit.color;
                    else if (isPartial) cellBg = habit.color + "55";
                    return (
                      <div key={day} title={day}
                        style={{ width: 11, height: 11, borderRadius: 2, background: cellBg, border: isToday ? `1px solid ${habit.color}` : "none", transition: "background 0.2s" }} />
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginTop: "0.875rem" }}>
              <span style={{ color: muted, fontSize: "0.7rem" }}>Less</span>
              {["#1e293b", habit.color + "55", habit.color].map((c, i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: c }} />
              ))}
              <span style={{ color: muted, fontSize: "0.7rem" }}>More</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const labelStyle = {
  display: "block", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem",
};

const inputStyle = {
  width: "100%", padding: "0.5rem 0.75rem",
  background: "#0f172a", border: "1px solid #334155",
  borderRadius: 6, color: "#f1f5f9", fontSize: "0.875rem", outline: "none",
};
