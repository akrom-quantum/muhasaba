"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BookOpen } from "lucide-react";
import MuhasabaCard from "./MuhasabaCard";
import MuhasabaForm from "./MuhasabaForm";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function MuhasabaSection({ uid }) {
  const [entries, setEntries] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const col = collection(db, "users", uid, "muhasabaEntries");

  useEffect(() => {
    const q = query(col, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => e.date === todayKey()));
    });
  }, [uid]);

  async function handleSave(form) {
    setSaving(true);
    try {
      await addDoc(col, { ...form, date: todayKey(), createdAt: serverTimestamp() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", uid, "muhasabaEntries", id));
  }

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookOpen size={18} color="var(--accent)" />
          Muhasaba
          {entries.length > 0 && (
            <span style={{ background: "var(--accent-dim)", color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 20 }}>
              {entries.length}
            </span>
          )}
        </h2>
        <button onClick={() => setOpen(!open)}
          style={{ padding: "0.4rem 0.9rem", background: open ? "transparent" : "var(--accent)", border: `1px solid ${open ? "var(--border)" : "var(--accent)"}`, borderRadius: 8, color: open ? "var(--muted)" : "#fff", fontSize: "0.8rem", fontWeight: 600 }}>
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {open && <MuhasabaForm onSave={handleSave} onCancel={() => setOpen(false)} saving={saving} />}

      {entries.length === 0 && !open ? (
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>No entries today</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {entries.map((e) => <MuhasabaCard key={e.id} entry={e} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
