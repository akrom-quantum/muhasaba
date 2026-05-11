"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const accent = "#10b981";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";
const bg = "#0f172a";

const PRIORITIES = {
  high: { label: "High", color: "#ef4444", bg: "#450a0a" },
  medium: { label: "Med", color: "#f59e0b", bg: "#431407" },
  low: { label: "Low", color: "#6ee7b7", bg: "#064e3b" },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function TasksSection({ uid }) {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [adding, setAdding] = useState(false);

  const col = collection(db, "users", uid, "tasks");

  useEffect(() => {
    const q = query(col, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((t) => t.date === todayKey()));
    });
  }, [uid]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    try {
      await addDoc(col, { text: input.trim(), done: false, priority, date: todayKey(), createdAt: serverTimestamp() });
      setInput("");
    } finally {
      setAdding(false);
    }
  }

  async function toggleTask(id, done) {
    await updateDoc(doc(db, "users", uid, "tasks", id), { done: !done });
  }

  async function deleteTask(id) {
    await deleteDoc(doc(db, "users", uid, "tasks", id));
  }

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  return (
    <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>✅</span> Tasks
          {tasks.length > 0 && (
            <span style={{ background: accent + "33", color: accent, fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 20 }}>
              {completed.length}/{tasks.length}
            </span>
          )}
        </h2>
      </div>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task…"
          style={{ flex: 1, padding: "0.6rem 0.875rem", background: bg, border: `1px solid ${border}`, borderRadius: 8, color: "#f1f5f9", fontSize: "0.875rem", outline: "none" }}
        />
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {Object.entries(PRIORITIES).map(([k, v]) => (
            <button key={k} type="button" onClick={() => setPriority(k)}
              style={{ padding: "0.4rem 0.6rem", borderRadius: 6, border: `1px solid ${priority === k ? v.color : border}`, background: priority === k ? v.bg : "transparent", color: priority === k ? v.color : muted, fontSize: "0.7rem", fontWeight: 700 }}>
              {v.label}
            </button>
          ))}
        </div>
        <button type="submit" disabled={adding || !input.trim()} style={{ padding: "0.5rem 1rem", background: accent, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.875rem", opacity: adding || !input.trim() ? 0.5 : 1 }}>
          +
        </button>
      </form>

      {tasks.length === 0 ? (
        <p style={{ color: muted, fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>No tasks today</p>
      ) : (
        <div>
          {pending.length > 0 && (
            <div style={{ marginBottom: "0.75rem" }}>
              {pending.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p style={{ color: muted, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Done</p>
              {completed.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  const p = PRIORITIES[task.priority] || PRIORITIES.medium;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: 8, background: "#0f172a", border: `1px solid ${task.done ? "#1e293b" : "#334155"}`, marginBottom: "0.4rem" }}>
      <button onClick={() => onToggle(task.id, task.done)}
        style={{ width: 20, height: 20, borderRadius: 4, background: task.done ? "#10b981" : "transparent", border: `2px solid ${task.done ? "#10b981" : "#475569"}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
        {task.done && <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 900 }}>✓</span>}
      </button>
      <span style={{ flex: 1, color: task.done ? "#475569" : "#cbd5e1", fontSize: "0.875rem", textDecoration: task.done ? "line-through" : "none" }}>
        {task.text}
      </span>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: 4, background: p.bg, color: p.color }}>
        {p.label}
      </span>
      <button onClick={() => onDelete(task.id)} style={{ background: "transparent", border: "none", color: "#475569", fontSize: "0.8rem", lineHeight: 1, padding: "0.2rem", flexShrink: 0 }}>✕</button>
    </div>
  );
}
