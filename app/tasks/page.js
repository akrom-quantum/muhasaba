"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import TaskCard from "@/components/tasks/TaskCard";
import TaskCalendar from "@/components/tasks/TaskCalendar";
import { CheckSquare, Plus } from "lucide-react";

const accent  = "var(--accent)";
const bg      = "var(--bg)";
const surface = "var(--surface)";
const border  = "var(--border)";
const muted   = "var(--muted)";

const PRIORITIES = {
  high:   { label: "High", color: "var(--prio-high-text)", bg: "var(--prio-high-bg)" },
  medium: { label: "Med",  color: "var(--prio-med-text)",  bg: "var(--prio-med-bg)"  },
  low:    { label: "Low",  color: "var(--prio-low-text)",  bg: "var(--prio-low-bg)"  },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function TasksPage() {
  const user   = useAuth();
  const router = useRouter();
  const [tasks,        setTasks]        = useState([]);
  const [input,        setInput]        = useState("");
  const [priority,     setPriority]     = useState("medium");
  const [adding,       setAdding]       = useState(false);
  const [addError,     setAddError]     = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey());

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const col = collection(db, "users", user.uid, "tasks");
    return onSnapshot(query(col), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTasks(docs);
    }, (err) => setAddError("Error: " + err.message));
  }, [user]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    setAddError("");
    try {
      const col = collection(db, "users", user.uid, "tasks");
      await addDoc(col, {
        text: input.trim(),
        done: false,
        priority,
        date: selectedDate || todayKey(),
        createdAt: Date.now(),
      });
      setInput("");
    } catch (err) {
      setAddError(err.message || "Failed to add task");
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

  const today     = todayKey();
  const pending   = tasks.filter((t) => !t.done).length;
  const done      = tasks.filter((t) => t.done).length;
  const overdue   = tasks.filter((t) => !t.done && t.date < today).length;
  const todayTasks = tasks.filter((t) => t.date === today);

  const dayTasks  = selectedDate ? tasks.filter((t) => t.date === selectedDate) : [];
  const dateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <CheckSquare size={24} color={accent} /> Tasks
          </h1>
          <p style={{ color: muted, fontSize: "0.875rem" }}>
            {pending} pending · {done} done
            {overdue > 0 && <span style={{ color: "var(--danger)", marginLeft: "0.5rem" }}>· {overdue} overdue</span>}
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
          {[
            { label: "Today",   value: `${todayTasks.filter(t => t.done).length}/${todayTasks.length}`, color: accent },
            { label: "Pending", value: pending, color: "#f59e0b" },
            { label: "Overdue", value: overdue, color: overdue > 0 ? "var(--danger)" : muted },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: surface, borderRadius: 12, padding: "1rem 1.25rem", border: `1px solid ${border}` }}>
              <p style={{ color: muted, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>{label}</p>
              <span style={{ color, fontSize: "1.5rem", fontWeight: 800 }}>{value}</span>
            </div>
          ))}
        </div>

        <style>{`@media (max-width: 767px) { .tasks-grid { grid-template-columns: 1fr !important; } }`}</style>
        {/* Main grid: calendar + task panel */}
        <div className="tasks-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)", gap: "1.5rem", alignItems: "start" }}>

          {/* Calendar */}
          <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
            <TaskCalendar tasks={tasks} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          {/* Right panel: add form + day task list */}
          <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
            <p style={{ color: muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
              {selectedDate === today ? "Today" : dateLabel || "All Tasks"}
            </p>

            {/* Add form */}
            <form onSubmit={handleAdd} style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <input
                  value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={`Add to ${selectedDate === today ? "today" : dateLabel || "tasks"}…`}
                  style={{ flex: 1, padding: "0.65rem 0.875rem", background: bg, border: `1px solid ${border}`, borderRadius: 8, color: "var(--text)", fontSize: "0.875rem", outline: "none", minWidth: 0 }}
                />
                <button type="submit" disabled={adding || !input.trim()}
                  style={{ padding: "0.6rem 1rem", background: accent, border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: "0.875rem", opacity: adding || !input.trim() ? 0.5 : 1, flexShrink: 0 }}>
                  + Add
                </button>
              </div>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {Object.entries(PRIORITIES).map(([k, v]) => (
                  <button key={k} type="button" onClick={() => setPriority(k)}
                    style={{ padding: "0.3rem 0.65rem", borderRadius: 6, border: `1px solid ${priority === k ? v.color : border}`, background: priority === k ? v.bg : "transparent", color: priority === k ? v.color : muted, fontSize: "0.72rem", fontWeight: 700 }}>
                    {v.label}
                  </button>
                ))}
              </div>
              {addError && <p style={{ color: "var(--danger)", fontSize: "0.78rem", marginTop: "0.4rem" }}>⚠ {addError}</p>}
            </form>

            {/* Day task list */}
            {selectedDate ? (
              dayTasks.length === 0 ? (
                <p style={{ color: muted, fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>No tasks for this day</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {dayTasks.map((t) => (
                    <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </div>
              )
            ) : (
              <p style={{ color: muted, fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>Select a day on the calendar</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
