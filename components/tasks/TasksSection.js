"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckSquare } from "lucide-react";
import TaskCard from "./TaskCard";

const PRIORITIES = {
  high:   { label: "High", color: "var(--prio-high-text)", bg: "var(--prio-high-bg)" },
  medium: { label: "Med",  color: "var(--prio-med-text)",  bg: "var(--prio-med-bg)"  },
  low:    { label: "Low",  color: "var(--prio-low-text)",  bg: "var(--prio-low-bg)"  },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function TasksSection({ uid, date }) {
  const activeDate = date || todayKey();
  const [allTasks, setAllTasks] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [adding, setAdding] = useState(false);

  const col = collection(db, "users", uid, "tasks");

  useEffect(() => {
    const q = query(col);
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const at = a.createdAt?.toMillis?.() ?? (a.createdAt || 0);
        const bt = b.createdAt?.toMillis?.() ?? (b.createdAt || 0);
        return bt - at;
      });
      setAllTasks(docs);
    });
  }, [uid]);

  const tasks = allTasks.filter((t) => t.date === activeDate);

  async function handleAdd() {
    if (!input.trim()) return;
    setAdding(true);
    try {
      await addDoc(col, { text: input.trim(), done: false, priority, date: activeDate, createdAt: Date.now() });
      setInput("");
    } finally {
      setAdding(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleAdd();
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
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckSquare size={18} color="var(--accent)" />
          Tasks
          {tasks.length > 0 && (
            <span style={{ background: "var(--accent-dim)", color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 20 }}>
              {done.length}/{tasks.length}
            </span>
          )}
        </h2>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
          <input
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Add a task…"
            style={{ flex: 1, padding: "0.6rem 0.875rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.875rem", outline: "none", minWidth: 0 }}
          />
          <button type="button" onClick={handleAdd} disabled={adding || !input.trim()}
            style={{ padding: "0.5rem 0.875rem", background: "var(--accent)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: "0.875rem", opacity: adding || !input.trim() ? 0.5 : 1, flexShrink: 0 }}>
            + Add
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {Object.entries(PRIORITIES).map(([k, v]) => (
            <button key={k} type="button" onClick={() => setPriority(k)}
              style={{ padding: "0.3rem 0.6rem", borderRadius: 6, border: `1px solid ${priority === k ? v.color : "var(--border)"}`, background: priority === k ? v.bg : "transparent", color: priority === k ? v.color : "var(--muted)", fontSize: "0.7rem", fontWeight: 700 }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>No tasks today</p>
      ) : (
        <>
          {pending.map((t) => <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
          {done.length > 0 && (
            <>
              <p style={{ color: "var(--muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0.75rem 0 0.4rem" }}>Done</p>
              {done.map((t) => <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}
