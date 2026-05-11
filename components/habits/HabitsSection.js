"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Target } from "lucide-react";
import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";

const accent = "#10b981";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitsSection({ uid }) {
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState({});
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
    if (!habits.length) return;
    const today = todayKey();
    const unsubs = habits.map((h) =>
      onSnapshot(doc(db, "users", uid, "habits", h.id, "logs", today), (snap) => {
        setTodayLogs((prev) => ({ ...prev, [h.id]: snap.exists() ? snap.data() : null }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [habits, uid]);

  async function handleAddHabit(form) {
    setSaving(true);
    try {
      await addDoc(habitsCol, { ...form, streak: 0, bestStreak: 0, lastCompletedDate: null, createdAt: serverTimestamp() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(habit) {
    const today = todayKey();
    const logRef = doc(db, "users", uid, "habits", habit.id, "logs", today);
    const existing = todayLogs[habit.id];
    if (existing?.done) {
      await setDoc(logRef, { done: false, value: 0, date: today });
    } else {
      await setDoc(logRef, { done: true, value: 1, date: today });
      await updateStreak(habit.id);
    }
  }

  async function handleCountChange(habit, delta) {
    const today = todayKey();
    const logRef = doc(db, "users", uid, "habits", habit.id, "logs", today);
    const existing = todayLogs[habit.id];
    const current = existing?.value || 0;
    const newVal = Math.max(0, current + delta);
    const done = newVal >= (habit.goalValue || 1);
    await setDoc(logRef, { done, value: newVal, date: today });
    if (done && !existing?.done) await updateStreak(habit.id);
  }

  async function updateStreak(habitId) {
    const habitRef = doc(db, "users", uid, "habits", habitId);
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

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", uid, "habits", id));
  }

  const doneCount = habits.filter((h) => todayLogs[h.id]?.done).length;

  return (
    <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Target size={18} color={accent} />
          Habits
          {habits.length > 0 && (
            <span style={{ background: accent + "22", color: accent, fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 20 }}>
              {doneCount}/{habits.length}
            </span>
          )}
        </h2>
        <button onClick={() => setOpen(!open)}
          style={{ padding: "0.4rem 0.9rem", background: open ? "transparent" : accent, border: `1px solid ${open ? border : accent}`, borderRadius: 8, color: open ? muted : "#fff", fontSize: "0.8rem", fontWeight: 600 }}>
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {open && <HabitForm onSave={handleAddHabit} onCancel={() => setOpen(false)} saving={saving} />}

      {habits.length === 0 && !open ? (
        <p style={{ color: muted, fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>No habits yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {habits.map((h) => (
            <HabitCard
              key={h.id} habit={h} log={todayLogs[h.id]}
              onToggle={handleToggle}
              onCountChange={handleCountChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
