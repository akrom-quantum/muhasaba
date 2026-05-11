"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const accent = "#10b981";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";
const bg = "#0f172a";

const LOG_TYPES = ["Book", "Lecture", "Podcast", "Video", "Article", "Reflection"];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const empty = { type: "Book", author: "", title: "", topic: "", notes: "" };

export default function MuhasabaSection({ uid }) {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const col = collection(db, "users", uid, "muhasaba");

  useEffect(() => {
    const q = query(col, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((l) => l.date === todayKey()));
    });
  }, [uid]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await addDoc(col, { ...form, date: todayKey(), createdAt: serverTimestamp() });
      setForm(empty);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", uid, "muhasaba", id));
  }

  return (
    <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>📖</span> Muhasaba
        </h2>
        <button
          onClick={() => setOpen(!open)}
          style={{ padding: "0.4rem 0.9rem", background: open ? "transparent" : accent, border: `1px solid ${open ? border : accent}`, borderRadius: 8, color: open ? muted : "#fff", fontSize: "0.8rem", fontWeight: 600 }}
        >
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleAdd} style={{ marginBottom: "1.25rem", background: bg, borderRadius: 12, padding: "1.25rem", border: `1px solid ${border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                {LOG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Topic</label>
              <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Aqeedah" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Title <span style={{ color: "#ef4444" }}>*</span></label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Author</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical", height: "auto" }} />
          </div>
          <button type="submit" disabled={saving} style={{ padding: "0.5rem 1.25rem", background: accent, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.875rem", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      {logs.length === 0 ? (
        <p style={{ color: muted, fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>No entries today</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {logs.map((log) => (
            <div key={log.id} style={{ background: bg, borderRadius: 10, padding: "0.875rem 1rem", border: `1px solid ${border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                    <span style={{ background: "#064e3b", color: "#6ee7b7", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>{log.type}</span>
                    {log.topic && <span style={{ color: accent, fontSize: "0.75rem" }}>{log.topic}</span>}
                  </div>
                  <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.title}</p>
                  {log.author && <p style={{ color: muted, fontSize: "0.8rem" }}>by {log.author}</p>}
                  {log.notes && <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.4rem", lineHeight: 1.5 }}>{log.notes}</p>}
                </div>
                <button onClick={() => handleDelete(log.id)} style={{ background: "transparent", border: "none", color: "#475569", fontSize: "1rem", padding: "0.25rem", lineHeight: 1, flexShrink: 0 }}>✕</button>
              </div>
            </div>
          ))}
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
