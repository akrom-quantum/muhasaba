"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import TaskCard from "@/components/tasks/TaskCard";
import { CheckSquare, Plus, Calendar } from "lucide-react";

const accent = "#10b981";
const bg = "#0f172a";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";

const PRIORITIES = {
  high:   { label: "High", color: "#ef4444", bg: "#450a0a" },
  medium: { label: "Med",  color: "#f59e0b", bg: "#431407" },
  low:    { label: "Low",  color: "#6ee7b7", bg: "#064e3b" },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(dateStr) {
  const today = todayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yKey) return "Yesterday";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function TasksPage() {
  const user = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("all"); // all | pending | done

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const col = collection(db, "users", user.uid, "tasks");
    const q = query(col, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    try {
      const col = collection(db, "users", user.uid, "tasks");
      await addDoc(col, { text: input.trim(), done: false, priority, date: todayKey(), createdAt: serverTimestamp() });
      setInput("");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id, done) {
    await updateDoc(doc(db, "users", user.uid, "tasks", id), { done: !done });
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
  }

  if (!user) return null;

  // Filter tasks
  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  // Group by date
  const groups = {};
  filtered.forEach((t) => {
    const key = t.date || todayKey();
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const totalPending = tasks.filter((t) => !t.done).length;
  const totalDone = tasks.filter((t) => t.done).length;
  const todayTasks = tasks.filter((t) => t.date === todayKey());
  const overdue = tasks.filter((t) => !t.done && t.date < todayKey());

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f1f5f9", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <CheckSquare size={24} color={accent} /> Tasks
          </h1>
          <p style={{ color: muted, fontSize: "0.875rem" }}>
            {totalPending} pending · {totalDone} done
            {overdue.length > 0 && <span style={{ color: "#ef4444", marginLeft: "0.5rem" }}>· {overdue.length} overdue</span>}
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Today", value: `${todayTasks.filter(t => t.done).length}/${todayTasks.length}`, color: accent },
            { label: "Pending", value: totalPending, color: "#f59e0b" },
            { label: "Overdue", value: overdue.length, color: overdue.length > 0 ? "#ef4444" : muted },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: surface, borderRadius: 12, padding: "1rem 1.25rem", border: `1px solid ${border}` }}>
              <p style={{ color: muted, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>{label}</p>
              <span style={{ color, fontSize: "1.5rem", fontWeight: 800 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Add task */}
        <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task…"
            style={{ flex: 1, padding: "0.7rem 1rem", background: surface, border: `1px solid ${border}`, borderRadius: 10, color: "#f1f5f9", fontSize: "0.9rem", outline: "none" }}
          />
          <div style={{ display: "flex", gap: "0.3rem" }}>
            {Object.entries(PRIORITIES).map(([k, v]) => (
              <button key={k} type="button" onClick={() => setPriority(k)}
                style={{ padding: "0.4rem 0.7rem", borderRadius: 7, border: `1px solid ${priority === k ? v.color : border}`, background: priority === k ? v.bg : "transparent", color: priority === k ? v.color : muted, fontSize: "0.72rem", fontWeight: 700 }}>
                {v.label}
              </button>
            ))}
          </div>
          <button type="submit" disabled={adding || !input.trim()}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", background: accent, border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: "0.875rem", opacity: adding || !input.trim() ? 0.5 : 1 }}>
            <Plus size={15} /> Add
          </button>
        </form>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1.25rem", background: surface, borderRadius: 10, padding: 4, width: "fit-content" }}>
          {[["all", "All"], ["pending", "Pending"], ["done", "Done"]].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{ padding: "0.4rem 0.875rem", borderRadius: 7, border: "none", background: filter === key ? accent : "transparent", color: filter === key ? "#fff" : muted, fontSize: "0.8rem", fontWeight: filter === key ? 700 : 400 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Task groups by date */}
        {sortedDates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: muted }}>
            <CheckSquare size={40} color="#334155" style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>No tasks</p>
            <p style={{ fontSize: "0.875rem" }}>Add your first task above.</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                <Calendar size={13} color={date === todayKey() ? accent : muted} />
                <span style={{ color: date === todayKey() ? accent : muted, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {formatDateLabel(date)}
                </span>
                {date < todayKey() && groups[date].some((t) => !t.done) && (
                  <span style={{ background: "#450a0a", color: "#ef4444", fontSize: "0.65rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: 4 }}>OVERDUE</span>
                )}
              </div>
              {groups[date].map((t) => (
                <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
