"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import { CalendarDays, Clock, BookMarked, Target, CheckSquare, BookOpen, Headphones } from "lucide-react";
import { DEFAULT_REPEAT } from "@/components/habits/RepeatPicker";

const SALAHS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const STATUS_CFG = {
  "on-time": { label: "On Time", color: "var(--ok-text)",   bg: "var(--ok-bg)"   },
  "qaza":    { label: "Qaza",    color: "var(--warn-text)", bg: "var(--warn-bg)" },
  "missed":  { label: "Missed",  color: "var(--err-text)",  bg: "var(--err-bg)"  },
};
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function todayKey() { return new Date().toISOString().slice(0, 10); }

function getMonthDays(year, month) {
  const days = [];
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= total; d++) {
    days.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return days;
}

function dayDotColor(ibadah, dayTasks) {
  const salahs = ibadah?.salahs || {};
  const vals = Object.values(salahs).filter(Boolean);
  if (vals.includes("missed")) return "#ef4444";
  const done = vals.filter(v => v === "on-time" || v === "qaza");
  if (done.length === 5) return "var(--accent)";
  if (done.length > 0 || ibadah?.quranEntries?.length > 0) return "#f59e0b";
  if (dayTasks?.length > 0) return dayTasks.every(t => t.done) ? "var(--accent)" : "#f59e0b";
  return null;
}

function dayNameForDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });
}

function isScheduledForDate(habit, dateStr) {
  const repeat = habit.repeat || DEFAULT_REPEAT;
  if (repeat.type === "daily") return true;
  if (repeat.type === "times_per_week") return true;
  if (repeat.type === "specific_days") return (repeat.days || []).includes(dayNameForDate(dateStr));
  return true;
}

function Section({ icon, title, children }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 12, padding: "1rem 1.25rem", border: "1px solid var(--border)" }}>
      <p style={{ color: "var(--muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

export default function GeneralPage() {
  const user   = useAuth();
  const router = useRouter();
  const today  = todayKey();

  const [selectedDate, setSelectedDate] = useState(today);
  const [viewYear,  setViewYear]  = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [ibadahByDate, setIbadahByDate] = useState({});
  const [tasks,   setTasks]   = useState([]);
  const [habits,  setHabits]  = useState([]);
  const [habitLogs, setHabitLogs] = useState({});

  useEffect(() => { if (user === null) router.replace("/login"); }, [user, router]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(db, "users", user.uid, "ibadah")), (snap) => {
      const data = {};
      snap.docs.forEach(d => { data[d.id] = d.data(); });
      setIbadahByDate(data);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(db, "users", user.uid, "tasks")), (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(db, "users", user.uid, "habits")), (snap) => {
      setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  useEffect(() => {
    if (!user || !habits.length) return;
    setHabitLogs({});
    const unsubs = habits.map(h =>
      onSnapshot(doc(db, "users", user.uid, "habits", h.id, "logs", selectedDate), (snap) => {
        setHabitLogs(prev => ({ ...prev, [h.id]: snap.exists() ? snap.data() : null }));
      })
    );
    return () => unsubs.forEach(u => u());
  }, [user, habits, selectedDate]);

  if (!user) return null;

  const ibadah    = ibadahByDate[selectedDate];
  const dayTasks  = tasks.filter(t => t.date === selectedDate);
  const dayHabits = habits.filter(h => isScheduledForDate(h, selectedDate));
  const isPast    = selectedDate < today;

  const tasksByDate = {};
  tasks.forEach(t => { if (!tasksByDate[t.date]) tasksByDate[t.date] = []; tasksByDate[t.date].push(t); });

  const days = getMonthDays(viewYear, viewMonth);
  const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>

        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <CalendarDays size={24} color="var(--accent)" /> General
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Click a day to see your full record</p>
        </div>

        <style>{`@media (max-width: 767px) { .general-grid { grid-template-columns: 1fr !important; } }`}</style>
        <div className="general-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)", gap: "1.5rem", alignItems: "start" }}>

          {/* ── Calendar ─────────────────────────────── */}
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <button type="button" onClick={prevMonth} style={navBtn}>‹</button>
              <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <button type="button" onClick={nextMonth} style={navBtn}>›</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.65rem", fontWeight: 700 }}>{d}</div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
              {days.map((key, i) => {
                if (!key) return <div key={i} />;
                const isSelected = key === selectedDate;
                const isToday    = key === today;
                const dot = dayDotColor(ibadahByDate[key], tasksByDate[key]);
                return (
                  <button key={key} type="button" onClick={() => setSelectedDate(key)} style={{
                    aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 2, borderRadius: 8, cursor: "pointer",
                    border: isSelected ? "2px solid var(--accent)" : isToday ? "1px solid var(--accent)" : "1px solid transparent",
                    background: isSelected ? "var(--accent-dim)" : "transparent",
                    color: isSelected ? "var(--accent)" : "var(--text)",
                    fontSize: "0.8rem", fontWeight: isToday ? 700 : 400,
                  }}>
                    {new Date(key + "T00:00:00").getDate()}
                    {dot && <div style={{ width: 4, height: 4, borderRadius: "50%", background: dot }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
              {[["var(--accent)", "All done"], ["#f59e0b", "Partial"], ["#ef4444", "Missed"]].map(([color, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ color: "var(--muted)", fontSize: "0.65rem" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Day summary ───────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ background: "var(--surface)", borderRadius: 12, padding: "0.875rem 1.25rem", border: "1px solid var(--border)" }}>
              <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>{dateLabel}</p>
            </div>

            {/* Salah */}
            <Section icon={<Clock size={14} color="var(--accent)" />} title="Salah">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {SALAHS.map(s => {
                  const status = ibadah?.salahs?.[s] || "";
                  const cfg = STATUS_CFG[status];
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>{s}</span>
                      {cfg
                        ? <span style={{ background: cfg.bg, color: cfg.color, fontSize: "0.68rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 20 }}>{cfg.label}</span>
                        : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>
                      }
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Quran */}
            <Section icon={<BookMarked size={14} color="#f59e0b" />} title="Quran">
              {!ibadah?.quranEntries?.length
                ? <p style={{ color: "var(--muted)", fontSize: "0.82rem", margin: 0 }}>No entries</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {ibadah.quranEntries.map((e, i) => {
                      const QIcon = e.action === "listen" ? Headphones : BookOpen;
                      const color = e.action === "listen" ? "#38bdf8" : "#f59e0b";
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", borderBottom: i < ibadah.quranEntries.length - 1 ? "1px solid var(--border)" : "none" }}>
                          <QIcon size={13} color={color} />
                          <span style={{ color: "var(--text)", fontSize: "0.875rem" }}>
                            {e.trackType === "page" ? `${e.pages} pages` : `${e.surah} · ${e.fromAyah}–${e.toAyah}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
              }
            </Section>

            {/* Habits */}
            <Section icon={<Target size={14} color="var(--accent)" />} title="Habits">
              {dayHabits.length === 0
                ? <p style={{ color: "var(--muted)", fontSize: "0.82rem", margin: 0 }}>No habits scheduled</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {dayHabits.map(h => {
                      const done   = habitLogs[h.id]?.done;
                      const missed = isPast && !done;
                      return (
                        <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>{h.name}</span>
                          {done
                            ? <span style={badge("var(--ok-bg)", "var(--ok-text)")}>Done</span>
                            : missed
                              ? <span style={badge("var(--err-bg)", "var(--err-text)")}>Missed</span>
                              : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>
                          }
                        </div>
                      );
                    })}
                  </div>
              }
            </Section>

            {/* Tasks */}
            <Section icon={<CheckSquare size={14} color="var(--accent)" />} title="Tasks">
              {dayTasks.length === 0
                ? <p style={{ color: "var(--muted)", fontSize: "0.82rem", margin: 0 }}>No tasks</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {dayTasks.map(t => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <span style={{ color: t.done ? "var(--muted)" : "var(--text-2)", fontSize: "0.875rem", textDecoration: t.done ? "line-through" : "none", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.text}
                        </span>
                        {t.done
                          ? <span style={badge("var(--ok-bg)", "var(--ok-text)")}>Done</span>
                          : isPast
                            ? <span style={badge("var(--err-bg)", "var(--err-text)")}>Missed</span>
                            : <span style={badge("var(--warn-bg)", "var(--warn-text)")}>Pending</span>
                        }
                      </div>
                    ))}
                  </div>
              }
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}

const navBtn = { background: "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "0.3rem 0.7rem", color: "var(--muted)", cursor: "pointer", fontSize: "1rem" };
const badge  = (bg, color) => ({ background: bg, color, fontSize: "0.68rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 20, flexShrink: 0 });
