"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import IbadahSection from "@/components/ibadah/IbadahSection";
import QuranSection from "@/components/ibadah/QuranSection";
import MuhasabaSection from "@/components/muhasaba/MuhasabaSection";
import HabitsSection from "@/components/habits/HabitsSection";
import TasksSection from "@/components/tasks/TasksSection";

function formatDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function TodayPage() {
  const user = useAuth();
  const router = useRouter();

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
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem" }}>Today</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{formatDate()}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))", gap: "1.5rem" }}>
          <IbadahSection uid={user.uid} />
          <QuranSection uid={user.uid} />
          <MuhasabaSection uid={user.uid} />
          <HabitsSection uid={user.uid} />
          <TasksSection uid={user.uid} />
        </div>
      </main>
    </div>
  );
}
