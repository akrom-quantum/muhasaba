"use client";
import { useState } from "react";
import ColorPicker from "./ColorPicker";
import IconPicker from "./IconPicker";
import RepeatPicker, { DEFAULT_REPEAT } from "./RepeatPicker";
import { PREBUILT_HABITS } from "@/data/prebuiltHabits";

const empty = { name: "", icon: "Star", color: "#10b981", goalType: "boolean", goalValue: 1, unit: "", repeat: DEFAULT_REPEAT };

export default function HabitForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState(empty);
  const [tab, setTab] = useState("custom");

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, goalValue: Number(form.goalValue) || 1 });
  }

  return (
    <div style={{ background: "var(--bg)", borderRadius: 12, padding: "1.25rem", border: "1px solid var(--border)", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1rem", background: "var(--surface)", borderRadius: 8, padding: 3 }}>
        {["custom", "prebuilt"].map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            style={{ flex: 1, padding: "0.4rem", borderRadius: 6, border: "none", background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#fff" : "var(--muted)", fontSize: "0.8rem", fontWeight: tab === t ? 700 : 400 }}>
            {t === "custom" ? "Custom" : "Quick pick"}
          </button>
        ))}
      </div>

      {tab === "prebuilt" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {PREBUILT_HABITS.map((p) => (
            <button key={p.name} type="button" onClick={() => { setForm({ ...p }); setTab("custom"); }}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.875rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.875rem", textAlign: "left" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{p.goalType === "boolean" ? "✓ done" : `${p.goalValue} ${p.unit}`}</span>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>Habit Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Morning walk" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Icon</label>
              <IconPicker value={form.icon} color={form.color} onChange={(v) => setForm({ ...form, icon: v })} />
            </div>
            <div>
              <label style={labelStyle}>Goal Type</label>
              <select value={form.goalType} onChange={(e) => setForm({ ...form, goalType: e.target.value })} style={inputStyle}>
                <option value="boolean">Done / Not done</option>
                <option value="count">Count</option>
              </select>
            </div>
          </div>
          {form.goalType === "count" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Goal</label>
                <input type="number" min="1" value={form.goalValue} onChange={(e) => setForm({ ...form, goalValue: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pages, mins…" style={inputStyle} />
              </div>
            </div>
          )}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>Color</label>
            <ColorPicker value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Repeat</label>
            <RepeatPicker value={form.repeat} onChange={(v) => setForm({ ...form, repeat: v })} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" disabled={saving}
              style={{ padding: "0.5rem 1.25rem", background: form.color, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: "0.875rem", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Add Habit"}
            </button>
            <button type="button" onClick={onCancel}
              style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--muted)", fontSize: "0.875rem" }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const labelStyle = { display: "block", color: "var(--muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" };
const inputStyle = { width: "100%", padding: "0.5rem 0.75rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.875rem", outline: "none" };
