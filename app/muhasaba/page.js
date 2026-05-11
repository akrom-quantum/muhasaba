"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import MuhasabaCalendar from "@/components/muhasaba/MuhasabaCalendar";
import MuhasabaForm from "@/components/muhasaba/MuhasabaForm";
import MuhasabaCard from "@/components/muhasaba/MuhasabaCard";
import { BookOpen, Plus } from "lucide-react";

const accent = "var(--accent)";
const bg = "var(--bg)";
const border = "var(--border)";
const muted = "var(--muted)";
const surface = "var(--surface)";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function MuhasabaPage() {
  const user = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const col = collection(db, "users", user.uid, "muhasabaEntries");
    const q = query(col, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  async function handleSave(form) {
    setSaving(true);
    try {
      const col = collection(db, "users", user.uid, "muhasabaEntries");
      await addDoc(col, { ...form, date: todayKey(), createdAt: serverTimestamp() });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const todayEntries = entries.filter((e) => e.date === todayKey());
  const totalEntries = entries.length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <BookOpen size={24} color={accent} /> Muhasaba
            </h1>
            <p style={{ color: muted, fontSize: "0.875rem" }}>{totalEntries} total entries</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.1rem", background: showForm ? "transparent" : accent, border: `1px solid ${showForm ? border : accent}`, borderRadius: 10, color: showForm ? muted : "#fff", fontWeight: 600, fontSize: "0.875rem" }}>
            <Plus size={15} />
            {showForm ? "Cancel" : "Add Entry"}
          </button>
        </div>

        {showForm && (
          <div style={{ maxWidth: 600, marginBottom: "1.5rem" }}>
            <MuhasabaForm onSave={handleSave} onCancel={() => setShowForm(false)} saving={saving} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: "1.5rem", alignItems: "start" }}>
          {/* Calendar */}
          <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
            <MuhasabaCalendar entries={entries} />
          </div>

          {/* Today's entries */}
          <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
            <p style={{ color: muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Today</p>
            {todayEntries.length === 0 ? (
              <p style={{ color: muted, fontSize: "0.875rem" }}>No entries today</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {todayEntries.map((e) => <MuhasabaCard key={e.id} entry={e} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
