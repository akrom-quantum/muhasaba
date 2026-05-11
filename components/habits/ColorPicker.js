"use client";
import { COLOR_PALETTE } from "@/data/colorPalette";

export default function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {COLOR_PALETTE.map(({ name, hex }) => (
        <button key={hex} type="button" title={name} onClick={() => onChange(hex)}
          style={{ width: 26, height: 26, borderRadius: "50%", background: hex, padding: 0, border: "none", outline: value === hex ? "2px solid var(--text)" : "2px solid transparent", outlineOffset: 2, transform: value === hex ? "scale(1.15)" : "scale(1)", transition: "all 0.15s", cursor: "pointer" }} />
      ))}
    </div>
  );
}
