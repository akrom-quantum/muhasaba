"use client";
import { useState } from "react";
import { BookOpen, Mic, MessageCircle } from "lucide-react";

const TYPES = [
  { key: "book",         label: "Book",        Icon: BookOpen,      color: "#10b981" },
  { key: "maviza",       label: "Mawiza",       Icon: Mic,           color: "#f59e0b" },
  { key: "conversation", label: "Conversation", Icon: MessageCircle, color: "#38bdf8" },
];

const empty = { type: "book", author: "", title: "", topic: "", notes: "" };

export default function MuhasabaForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState(empty);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.author.trim() || !form.title.trim() || !form.topic.trim()) return;
    onSave(form);
  }

  const activeType = TYPES.find((t) => t.key === form.type);

  return (
    <form onSubmit={handleSubmit} style={{ background: "var(--bg)", borderRadius: 12, padding: "1.25rem", border: "1px solid var(--border)", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
        {TYPES.map(({ key, label, Icon, color }) => {
          const active = form.type === key;
          return (
            <button key={key} type="button" onClick={() => setForm({ ...form, type: key })}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.5rem 0.25rem", borderRadius: 8, border: `1px solid ${active ? color : "var(--border)"}`, background: active ? color + "1a" : "transparent", color: active ? color : "var(--muted)", fontSize: "0.8rem", fontWeight: active ? 700 : 400 }}>
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div>
          <label style={labelStyle}>Author / Person <span style={{ color: "var(--danger)" }}>*</span></label>
          <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required placeholder={form.type === "conversation" ? "Who?" : "Scholar / Author"} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Title / Series <span style={{ color: "var(--danger)" }}>*</span></label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder={form.type === "book" ? "Book name" : "Series / Episode"} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label style={labelStyle}>Topic <span style={{ color: "var(--danger)" }}>*</span></label>
        <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required placeholder="What was covered?" style={inputStyle} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Notes <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Personal reflection…" style={{ ...inputStyle, resize: "vertical", height: "auto", fontFamily: "inherit" }} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={saving}
          style={{ padding: "0.5rem 1.25rem", background: activeType?.color || "var(--accent)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.875rem", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : "Save Entry"}
        </button>
        <button type="button" onClick={onCancel}
          style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--muted)", fontSize: "0.875rem" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

const labelStyle = { display: "block", color: "var(--muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" };
const inputStyle = { width: "100%", padding: "0.5rem 0.75rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.875rem", outline: "none" };
