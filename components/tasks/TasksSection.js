"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckSquare } from "lucide-react";
import TaskCard from "./TaskCard";

const accent = "#10b981";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";
const bg = "#0f172a";

const PRIORITIES = {
  high:   { label: "High", color: "#ef4444", bg: "#450a0a" },
  medium: { label: "Med",  color: "#f59e0b", bg: "#431407" },
  low:    { label: "Low",  color: "#6ee7b7", bg: "#064e3b" },
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
      const today = todayKey();
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((t) => t.date === today));
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

  async function handleToggle(id, done) {
    await updateDoc(doc(db, "users", uid, "tasks", id), { done: !done });
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", uid, "tasks", id));
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckSquare size={18} color={accent} />
          Tasks
          {tasks.length > 0 && (
            <span style={{ background: accent + "22", color: accent, fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 20 }}>
              {done.length}/{tasks.length}
            </span>
          )}
        </h2>
      </div>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
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
        <button type="submit" disabled={adding || !input.trim()}
          style={{ padding: "0.5rem 1rem", background: accent, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.875rem", opacity: adding || !input.trim() ? 0.5 : 1 }}>
          +
        </button>
      </form>

      {tasks.length === 0 ? (
        <p style={{ color: muted, fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>No tasks today</p>
      ) : (
        <>
          {pending.map((t) => <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
          {done.length > 0 && (
            <>
              <p style={{ color: muted, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0.75rem 0 0.4rem" }}>Done</p>
              {done.map((t) => <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}
