"use client";
import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Clock } from "lucide-react";

const SALAHS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const STATUS = {
  "on-time": { label: "On Time", bg: "#064e3b", color: "#6ee7b7", border: "#065f46" },
  "qaza":    { label: "Qaza",    bg: "#431407", color: "#fdba74", border: "#7c2d12" },
  "missed":  { label: "Missed",  bg: "#2d0707", color: "#ef4444", border: "#991b1b" },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function IbadahSection({ uid }) {
  const [data, setData] = useState({ salahs: {} });

  const docRef = doc(db, "users", uid, "ibadah", todayKey());

  useEffect(() => {
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) setData(snap.data());
    });
  }, [uid]);

  function setSalahStatus(salah, status) {
    const current = data.salahs?.[salah];
    const next = current === status ? "" : status;
    const updated = { ...data, salahs: { ...data.salahs, [salah]: next } };
    setData(updated);
    setDoc(docRef, updated, { merge: true });
  }

  const completedCount = SALAHS.filter((s) => ["on-time", "qaza"].includes(data.salahs?.[s])).length;

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={18} color="var(--accent)" />
          Ibadah
        </h2>
        <span style={{ background: "var(--accent-dim)", color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 20 }}>
          {completedCount}/5 salah
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {SALAHS.map((salah) => {
          const status = data.salahs?.[salah] || "";
          const cfg = STATUS[status];
          return (
            <div key={salah} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "var(--bg)", borderRadius: 8, border: `1px solid ${cfg?.border || "var(--border)"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <Clock size={13} color={status === "on-time" ? "var(--accent)" : "var(--muted)"} />
                <span style={{ color: status ? "var(--text)" : "var(--text-2)", fontSize: "0.875rem", fontWeight: 500 }}>{salah}</span>
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                {Object.entries(STATUS).map(([key, s]) => {
                  const active = status === key;
                  return (
                    <button key={key} onClick={() => setSalahStatus(salah, key)}
                      style={{ padding: "0.25rem 0.625rem", borderRadius: 5, border: `1px solid ${active ? s.border : "var(--border)"}`, background: active ? s.bg : "transparent", color: active ? s.color : "var(--muted)", fontSize: "0.7rem", fontWeight: active ? 700 : 400, transition: "all 0.15s" }}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
