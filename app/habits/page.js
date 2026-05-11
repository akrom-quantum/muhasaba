"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import HabitForm from "@/components/habits/HabitForm";
import { ICON_MAP } from "@/data/iconMap";
import { Plus, Target, Flame, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";

const accent = "#10b981";
const bg = "#0f172a";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitsPage() {
  const user = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const col = collection(db, "users", user.uid, "habits");
    const q = query(col, orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      setHabits(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  useEffect(() => {
    if (!user || !habits.length) return;
    const today = todayKey();
    const unsubs = habits.map((h) =>
      onSnapshot(doc(db, "users", user.uid, "habits", h.id, "logs", today), (snap) => {
        setTodayLogs((prev) => ({ ...prev, [h.id]: snap.exists() ? snap.data() : null }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [habits, user]);

  async function handleSave(form) {
    setSaving(true);
    try {
      const col = collection(db, "users", user.uid, "habits");
      await addDoc(col, { ...form, streak: 0, bestStreak: 0, lastCompletedDate: null, createdAt: serverTimestamp() });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", user.uid, "habits", id));
  }

  if (!user) return null;

  const doneToday = habits.filter((h) => todayLogs[h.id]?.done).length;
  const topStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const bestEver = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f1f5f9", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <Target size={24} color={accent} /> Habits
            </h1>
            <p style={{ color: muted, fontSize: "0.875rem" }}>{habits.length} habits · {doneToday} done today</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.1rem", background: showForm ? "transparent" : accent, border: `1px solid ${showForm ? border : accent}`, borderRadius: 10, color: showForm ? muted : "#fff", fontWeight: 600, fontSize: "0.875rem" }}>
            <Plus size={15} />
            {showForm ? "Cancel" : "New Habit"}
          </button>
        </div>

        {/* Stats strip */}
        {habits.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Today", value: `${doneToday}/${habits.length}`, icon: <Target size={16} color={accent} />, color: accent },
              { label: "Top Streak", value: topStreak, icon: <Flame size={16} color="#f97316" />, color: "#f97316" },
              { label: "Best Ever", value: bestEver, icon: <Trophy size={16} color="#f59e0b" />, color: "#f59e0b" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ background: surface, borderRadius: 12, padding: "1rem 1.25rem", border: `1px solid ${border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                  {icon}
                  <span style={{ color: muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                </div>
                <span style={{ color, fontSize: "1.5rem", fontWeight: 800 }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div style={{ maxWidth: 560, marginBottom: "1.5rem" }}>
            <HabitForm onSave={handleSave} onCancel={() => setShowForm(false)} saving={saving} />
          </div>
        )}

        {habits.length === 0 && !showForm ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: muted }}>
            <Target size={40} color="#334155" style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "#475569" }}>No habits yet</p>
            <p style={{ fontSize: "0.875rem" }}>Add your first habit to start tracking.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {habits.map((h) => {
              const Icon = ICON_MAP[h.icon] || ICON_MAP["Star"];
              const log = todayLogs[h.id];
              const done = log?.done || false;
              const value = log?.value || 0;
              const progress = h.goalType === "count" ? Math.min(1, value / (h.goalValue || 1)) : done ? 1 : 0;

              return (
                <Link key={h.id} href={`/habits/${h.id}`}
                  style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", background: surface, borderRadius: 12, border: `1px solid ${done ? h.color + "44" : border}`, textDecoration: "none", transition: "border-color 0.2s" }}>
                  {/* Color accent bar */}
                  <div style={{ width: 4, height: 40, borderRadius: 2, background: h.color, flexShrink: 0 }} />

                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: h.color + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={h.color} />
                  </div>

                  {/* Name + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.2rem" }}>
                      <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem" }}>{h.name}</span>
                      {h.streak > 0 && (
                        <span style={{ color: "#f97316", fontSize: "0.75rem", fontWeight: 700 }}>🔥 {h.streak}</span>
                      )}
                    </div>
                    {h.goalType === "count" ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                          <span style={{ color: muted, fontSize: "0.78rem" }}>{value} / {h.goalValue} {h.unit}</span>
                          <span style={{ color: done ? h.color : muted, fontSize: "0.75rem", fontWeight: done ? 700 : 400 }}>{Math.round(progress * 100)}%</span>
                        </div>
                        <div style={{ height: 3, background: border, borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${progress * 100}%`, background: h.color, borderRadius: 2, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: done ? h.color : muted, fontWeight: done ? 600 : 400 }}>
                        {done ? "Done today ✓" : "Not done yet"}
                      </span>
                    )}
                  </div>

                  <ChevronRight size={16} color="#475569" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
