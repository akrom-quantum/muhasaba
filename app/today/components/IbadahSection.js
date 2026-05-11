"use client";
import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const accent = "#10b981";
const surface = "#1e293b";
const border = "#334155";
const muted = "#94a3b8";

const SALAHS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function IbadahSection({ uid }) {
  const [data, setData] = useState({ salahs: {}, quran: { pages: 0, notes: "" } });
  const [quranInput, setQuranInput] = useState("");

  const docRef = doc(db, "users", uid, "ibadah", todayKey());

  useEffect(() => {
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setData(d);
        setQuranInput(String(d.quran?.pages ?? 0));
      }
    });
  }, [uid]);

  function setSalahStatus(salah, status) {
    const updated = { ...data, salahs: { ...data.salahs, [salah]: status } };
    setData(updated);
    setDoc(docRef, updated, { merge: true });
  }

  function saveQuranPages() {
    const pages = parseInt(quranInput) || 0;
    const updated = { ...data, quran: { ...data.quran, pages } };
    setData(updated);
    setDoc(docRef, updated, { merge: true });
  }

  const statusConfig = {
    "on-time": { label: "On Time", bg: "#064e3b", color: "#6ee7b7", border: "#065f46" },
    "qaza": { label: "Qaza", bg: "#431407", color: "#fdba74", border: "#7c2d12" },
    "missed": { label: "Missed", bg: "#1e293b", color: "#ef4444", border: "#991b1b" },
    "": { label: "—", bg: "#1e293b", color: muted, border },
  };

  return (
    <div style={{ background: surface, borderRadius: 16, padding: "1.5rem", border: `1px solid ${border}` }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.25rem" }}>🕌</span> Ibadah
      </h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Salah</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {SALAHS.map((salah) => {
            const status = data.salahs?.[salah] || "";
            return (
              <div key={salah} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#cbd5e1", fontSize: "0.9rem", fontWeight: 500, width: 80 }}>{salah}</span>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {["on-time", "qaza", "missed"].map((s) => {
                    const cfg = statusConfig[s];
                    const active = status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSalahStatus(salah, active ? "" : s)}
                        style={{
                          padding: "0.3rem 0.75rem",
                          borderRadius: 6,
                          border: `1px solid ${active ? cfg.border : border}`,
                          background: active ? cfg.bg : "transparent",
                          color: active ? cfg.color : muted,
                          fontSize: "0.75rem",
                          fontWeight: active ? 600 : 400,
                          transition: "all 0.15s",
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p style={{ color: muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Quran</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ color: muted, fontSize: "0.875rem" }}>Pages read today:</span>
          <input
            type="number"
            min="0"
            value={quranInput}
            onChange={(e) => setQuranInput(e.target.value)}
            onBlur={saveQuranPages}
            onKeyDown={(e) => e.key === "Enter" && saveQuranPages()}
            style={{ width: 72, padding: "0.4rem 0.6rem", background: "#0f172a", border: `1px solid ${border}`, borderRadius: 6, color: "#f1f5f9", fontSize: "0.9rem", outline: "none", textAlign: "center" }}
          />
          <span style={{ color: accent, fontSize: "0.875rem", fontWeight: 600 }}>
            {data.quran?.pages > 0 ? `${data.quran.pages}p` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
