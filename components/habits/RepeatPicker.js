"use client";

const DAYS      = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_ABBR = ["S",   "M",   "T",   "W",   "T",   "F",   "S"  ];

export const DEFAULT_REPEAT = { type: "daily", days: [...DAYS], timesPerWeek: 3 };

export default function RepeatPicker({ value, onChange }) {
  const repeat = value || DEFAULT_REPEAT;

  function setType(type) {
    if (type === "daily")          onChange({ type, days: [...DAYS], timesPerWeek: 3 });
    else if (type === "specific_days") onChange({ type, days: ["Mon","Tue","Wed","Thu","Fri"], timesPerWeek: 3 });
    else                           onChange({ type, days: [...DAYS], timesPerWeek: 3 });
  }

  function toggleDay(day) {
    const cur = repeat.days || [];
    const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day];
    if (next.length === 0) return;
    const sorted = DAYS.filter((d) => next.includes(d));
    onChange({ ...repeat, days: sorted });
  }

  const showDays = repeat.type === "daily" || repeat.type === "specific_days";

  return (
    <div>
      {/* Type tabs */}
      <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.875rem", background: "var(--surface)", borderRadius: 8, padding: 3 }}>
        {[
          ["daily",         "Daily"],
          ["specific_days", "Specific Days"],
          ["times_per_week","Times / Week"],
        ].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setType(key)}
            style={{ flex: 1, padding: "0.35rem 0.25rem", borderRadius: 6, border: "none", background: repeat.type === key ? "var(--accent)" : "transparent", color: repeat.type === key ? "#fff" : "var(--muted)", fontSize: "0.75rem", fontWeight: repeat.type === key ? 700 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Day pills */}
      {showDays && (
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {DAYS.map((day, i) => {
            const active = repeat.type === "daily" || (repeat.days || []).includes(day);
            const interactive = repeat.type === "specific_days";
            return (
              <button key={day} type="button"
                onClick={() => interactive && toggleDay(day)}
                title={day}
                style={{
                  flex: 1, height: 36, borderRadius: "50%", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "#fff" : "var(--muted)",
                  fontSize: "0.72rem", fontWeight: 700,
                  cursor: interactive ? "pointer" : "default",
                  transition: "all 0.15s",
                }}>
                {DAYS_ABBR[i]}
              </button>
            );
          })}
        </div>
      )}

      {/* Times per week bubbles */}
      {repeat.type === "times_per_week" && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => {
            const active = (repeat.timesPerWeek || 3) === n;
            return (
              <button key={n} type="button"
                onClick={() => onChange({ ...repeat, timesPerWeek: n })}
                style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent)" : "transparent", color: active ? "#fff" : "var(--muted)", fontSize: "0.875rem", fontWeight: 700, transition: "all 0.15s" }}>
                {n}
              </button>
            );
          })}
          <span style={{ color: "var(--muted)", fontSize: "0.78rem", marginLeft: "0.25rem" }}>× / week</span>
        </div>
      )}

      {/* Summary label */}
      <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: "0.5rem" }}>
        {repeat.type === "daily" && "Every day"}
        {repeat.type === "specific_days" && `${(repeat.days || []).length} day${(repeat.days || []).length !== 1 ? "s" : ""}/week · ${(repeat.days || []).join(", ")}`}
        {repeat.type === "times_per_week" && `${repeat.timesPerWeek} time${repeat.timesPerWeek !== 1 ? "s" : ""}/week, any day`}
      </p>
    </div>
  );
}

/* ── Helpers used by streak logic ── */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function todayDayName() {
  return DAY_NAMES[new Date().getDay()];
}

export function isScheduledToday(habit) {
  const repeat = habit.repeat || DEFAULT_REPEAT;
  if (repeat.type === "daily" || repeat.type === "times_per_week") return true;
  return (repeat.days || DAYS).includes(todayDayName());
}

export function getPrevScheduledDay(todayStr, days) {
  const d = new Date(todayStr + "T00:00:00");
  for (let i = 1; i <= 7; i++) {
    d.setDate(d.getDate() - 1);
    if (days.includes(DAY_NAMES[d.getDay()])) return d.toISOString().slice(0, 10);
  }
  return null;
}

export function getMonday(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
