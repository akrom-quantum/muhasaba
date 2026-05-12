"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import IbadahSection from "@/components/ibadah/IbadahSection";
import QuranSection from "@/components/ibadah/QuranSection";
import MuhasabaSection from "@/components/muhasaba/MuhasabaSection";
import HabitsSection from "@/components/habits/HabitsSection";
import TasksSection from "@/components/tasks/TasksSection";
import { CalendarDays } from "lucide-react";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function TodayPage() {
  const user = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(todayKey());

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {/* Header with date picker */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem" }}>
              {date === todayKey() ? "Today" : "Past Entry"}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{formatDateLabel(date)}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "0.5rem 0.875rem" }}>
            <CalendarDays size={15} color="var(--muted)" />
            <input
              type="date"
              value={date}
              max={todayKey()}
              onChange={(e) => setDate(e.target.value || todayKey())}
              style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: "0.875rem", outline: "none" }}
            />
            {date !== todayKey() && (
              <button onClick={() => setDate(todayKey())}
                style={{ background: "var(--accent-dim)", border: "none", color: "var(--accent)", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: 5 }}>
                Today
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))", gap: "1.5rem" }}>
          <IbadahSection uid={user.uid} date={date} />
          <QuranSection uid={user.uid} date={date} />
          <MuhasabaSection uid={user.uid} date={date} />
          <HabitsSection uid={user.uid} date={date} />
          <TasksSection uid={user.uid} date={date} />
        </div>
      </main>
    </div>
  );
}
