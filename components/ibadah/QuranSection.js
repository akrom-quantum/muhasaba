"use client";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BookMarked, Headphones, BookOpen, X, FileText, Hash } from "lucide-react";

const amber = "#f59e0b";
const sky   = "#38bdf8";

function todayKey() { return new Date().toISOString().slice(0, 10); }
function makeId()   { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const emptyForm = { action: "read", trackType: "page", pages: "", surah: "", fromAyah: "", toAyah: "", notes: "" };

export default function QuranSection({ uid, date }) {
  const activeDate = date || todayKey();
  const [entries, setEntries] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [form,    setForm]    = useState(emptyForm);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    setEntries([]);
    const ref = doc(db, "users", uid, "ibadah", activeDate);
    return onSnapshot(ref, (snap) => {
      setEntries(snap.exists() ? snap.data().quranEntries || [] : []);
    });
  }, [uid, activeDate]);

  async function handleAdd() {
    const valid = form.trackType === "page" ? !!form.pages : !!form.surah;
    if (!valid || saving) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", uid, "ibadah", activeDate);
      const entry = { id: makeId(), action: form.action, trackType: form.trackType, notes: form.notes, createdAt: Date.now() };
      if (form.trackType === "page") {
        entry.pages = Number(form.pages);
      } else {
        entry.surah = form.surah;
        entry.fromAyah = Number(form.fromAyah) || 1;
        entry.toAyah   = Number(form.toAyah)   || 1;
      }
      await updateDoc(ref, { quranEntries: arrayUnion(entry) }).catch(async () => {
        await setDoc(ref, { quranEntries: [entry] }, { merge: true });
      });
      setForm(emptyForm);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry) {
    const ref = doc(db, "users", uid, "ibadah", activeDate);
    await updateDoc(ref, { quranEntries: arrayRemove(entry) });
  }

  const totalPages = entries.filter(e => e.trackType === "page").reduce((s, e) => s + (e.pages || 0), 0);

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookMarked size={18} color={amber} /> Quran
          {totalPages > 0 && <span style={{ background: amber + "22", color: amber, fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 20 }}>{totalPages}p</span>}
          {entries.length > 0 && <span style={{ background: "var(--accent-dim)", color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 20 }}>{entries.length}</span>}
        </h2>
        <button onClick={() => setOpen(!open)}
          style={{ padding: "0.4rem 0.9rem", background: open ? "transparent" : "var(--accent)", border: `1px solid ${open ? "var(--border)" : "var(--accent)"}`, borderRadius: 8, color: open ? "var(--muted)" : "#fff", fontSize: "0.8rem", fontWeight: 600 }}>
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {open && (
        <div style={{ background: "var(--bg)", borderRadius: 12, padding: "1.25rem", border: "1px solid var(--border)", marginBottom: "1.25rem" }}>
          {/* Action */}
          <div style={{ marginBottom: "0.875rem" }}>
            <p style={labelStyle}>Action</p>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[{ key: "read", label: "Read", Icon: BookOpen, color: amber }, { key: "listen", label: "Listen", Icon: Headphones, color: sky }].map(({ key, label, Icon, color }) => {
                const active = form.action === key;
                return (
                  <button key={key} type="button" onClick={() => setForm({ ...form, action: key })}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.55rem", borderRadius: 8, border: `1px solid ${active ? color : "var(--border)"}`, background: active ? color + "1a" : "transparent", color: active ? color : "var(--muted)", fontSize: "0.85rem", fontWeight: active ? 700 : 400 }}>
                    <Icon size={14} /> {label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Track type */}
          <div style={{ marginBottom: "0.875rem" }}>
            <p style={labelStyle}>Type</p>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[{ key: "page", label: "Pages", Icon: FileText }, { key: "surah-ayah", label: "Surah & Ayah", Icon: Hash }].map(({ key, label, Icon }) => {
                const active = form.trackType === key;
                return (
                  <button key={key} type="button" onClick={() => setForm({ ...form, trackType: key })}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.55rem", borderRadius: 8, border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent-dim)" : "transparent", color: active ? "var(--accent)" : "var(--muted)", fontSize: "0.85rem", fontWeight: active ? 700 : 400 }}>
                    <Icon size={14} /> {label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Fields */}
          {form.trackType === "page" ? (
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={labelStyle}>Pages *</label>
              <input type="number" min="1" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} placeholder="e.g. 5" style={inputStyle} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.625rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Surah *</label>
                <input value={form.surah} onChange={(e) => setForm({ ...form, surah: e.target.value })} placeholder="e.g. Al-Baqarah" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>From</label>
                <input type="number" min="1" value={form.fromAyah} onChange={(e) => setForm({ ...form, fromAyah: e.target.value })} placeholder="1" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>To</label>
                <input type="number" min="1" value={form.toAyah} onChange={(e) => setForm({ ...form, toAyah: e.target.value })} placeholder="10" style={inputStyle} />
              </div>
            </div>
          )}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Reflection…" style={{ ...inputStyle, resize: "vertical", height: "auto", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" onClick={handleAdd} disabled={saving}
              style={{ padding: "0.5rem 1.25rem", background: form.action === "read" ? amber : sky, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.875rem", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setOpen(false)}
              style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--muted)", fontSize: "0.875rem" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && !open ? (
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>No Quran entries</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {[...entries].sort((a, b) => b.createdAt - a.createdAt).map((entry) => {
            const isRead = entry.action === "read";
            const color  = isRead ? amber : sky;
            const Icon   = isRead ? BookOpen : Headphones;
            return (
              <div key={entry.id} style={{ background: "var(--bg)", borderRadius: 10, padding: "0.875rem 1rem", border: "1px solid var(--border)", borderLeft: `3px solid ${color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: color + "1a", color, fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 20, textTransform: "uppercase" }}>
                        <Icon size={10} /> {entry.action}
                      </span>
                    </div>
                    {entry.trackType === "page" ? (
                      <p style={{ color: "var(--text)", fontWeight: 700, fontSize: "1rem" }}>{entry.pages} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.85rem" }}>pages</span></p>
                    ) : (
                      <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.925rem" }}>{entry.surah} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.82rem" }}>· {entry.fromAyah}–{entry.toAyah}</span></p>
                    )}
                    {entry.notes && <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.375rem", lineHeight: 1.55 }}>{entry.notes}</p>}
                  </div>
                  <button onClick={() => handleDelete(entry)} style={{ background: "transparent", border: "none", color: "var(--text-3)", display: "flex", alignItems: "center", padding: "0.2rem", flexShrink: 0 }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: "block", color: "var(--muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" };
const inputStyle = { width: "100%", padding: "0.5rem 0.75rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.875rem", outline: "none" };
