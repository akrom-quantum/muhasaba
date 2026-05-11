"use client";
import { BookOpen, Mic, MessageCircle, X } from "lucide-react";

const TYPE_CONFIG = {
  book:         { label: "Book",         Icon: BookOpen,      color: "#10b981" },
  maviza:       { label: "Mawiza",       Icon: Mic,           color: "#f59e0b" },
  conversation: { label: "Conversation", Icon: MessageCircle, color: "#38bdf8" },
};

export default function MuhasabaCard({ entry, onDelete }) {
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.book;
  const { Icon, color, label } = cfg;

  return (
    <div style={{ background: "var(--bg)", borderRadius: 10, padding: "0.875rem 1rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: color + "1a", color, fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 20, textTransform: "uppercase" }}>
              <Icon size={10} /> {label}
            </span>
            {entry.topic && <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{entry.topic}</span>}
          </div>
          <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.title}</p>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>by {entry.author}</p>
          {entry.notes && <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.5rem", lineHeight: 1.55 }}>{entry.notes}</p>}
        </div>
        {onDelete && (
          <button onClick={() => onDelete(entry.id)} style={{ background: "transparent", border: "none", color: "var(--text-3)", padding: "0.2rem", flexShrink: 0, display: "flex", alignItems: "center" }}>
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
