"use client";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { Navbar } from "@/components/ui/Navbar";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Button, Input } from "@heroui/react";
import type { JobApplication, ApplicationStatus, ApplicationPriority } from "@/components/dashboard/types";
import { ApplicationTable } from "@/components/dashboard/ApplicationTable";
import { AddApplicationModal } from "@/components/dashboard/AddApplicationModal";
import { loadApps, saveApps } from "@/lib/storage";
import { seedApps } from "@/lib/mockData";

const STATUSES: ApplicationStatus[] = ["Applied", "Interview", "Offer", "Rejected", "Wishlist"];
const PRIORITIES: ApplicationPriority[] = ["High", "Medium", "Low"];

export default function DashboardPage() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<ApplicationPriority | "All">("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);

  useEffect(() => {
    const existing = loadApps();
    if (existing.length) setApps(existing);
    else { setApps(seedApps); saveApps(seedApps); }
  }, []);

  useEffect(() => { saveApps(apps); }, [apps]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return apps.filter((a) => {
      const matchQ = !s || (
        a.company.toLowerCase().includes(s) ||
        a.role.toLowerCase().includes(s) ||
        a.status.toLowerCase().includes(s) ||
        (a.location ?? "").toLowerCase().includes(s) ||
        (a.salary ?? "").toLowerCase().includes(s) ||
        (a.notes ?? "").toLowerCase().includes(s)
      );
      const matchStatus   = statusFilter === "All"   || a.status === statusFilter;
      const matchPriority = priorityFilter === "All" || a.priority === priorityFilter;
      return matchQ && matchStatus && matchPriority;
    });
  }, [apps, q, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total:      apps.length,
    applied:    apps.filter((a) => a.status === "Applied").length,
    interviews: apps.filter((a) => a.status === "Interview").length,
    offers:     apps.filter((a) => a.status === "Offer").length,
  }), [apps]);

  const hasFilters = q !== "" || statusFilter !== "All" || priorityFilter !== "All";

  function pill(label: string, active: boolean, onClick: () => void, prefix = "") {
    return (
      <button
        key={prefix + label}
        onClick={onClick}
        style={{
          padding: "5px 14px",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 600,
          border: `1px solid ${active ? "#6366f1" : "#e2e8f0"}`,
          background: active ? "#ede9fe" : "#fff",
          color: active ? "#6366f1" : "#64748b",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <AuthGate>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .dashboard-root { min-height: 100svh; background: #f4f6f9 !important; font-family: 'DM Sans', sans-serif; }
        .stat-card { background: #fff !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; padding: 18px 22px !important; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .stat-value { font-size: 28px; font-weight: 800; font-family: 'Sora', sans-serif; line-height: 1; }
        .stat-label { font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .dashboard-card { background: #fff !important; border: 1px solid #e2e8f0 !important; border-radius: 14px !important; box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important; }
        .dashboard-card-header { border-bottom: 1px solid #f1f5f9; padding: 14px 18px !important; }
        .dashboard-search input { background: #fff !important; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; color: #1e293b !important; }
        .dashboard-search input::placeholder { color: #94a3b8 !important; }
        .dashboard-search { display: block !important; width: 100% !important; }
        .dashboard-search > div { width: 100% !important; max-width: 100% !important; box-shadow: none !important; background: transparent !important; }
        .dashboard-add-btn { background: linear-gradient(135deg,#6366f1,#8b5cf6) !important; border: none !important; font-weight: 600 !important; color: #fff !important; border-radius: 8px !important; }
        .divider { width: 1px; height: 20px; background: #e2e8f0; flex-shrink: 0; }
        .filter-group-label { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
      `}</style>

      <div className="dashboard-root">
        <Navbar />
        <main className="mx-auto max-w-6xl p-6">

          {/* Heading */}
          <div className="mb-6">
            <h1 style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a", letterSpacing: "-0.02em", fontSize: 30, fontWeight: 800, margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: 15 }}>
              Track your job applications in one place.
            </p>
          </div>

          {/* Stat cards */}
          <div className="mb-6" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 12 }}>
            <div className="stat-card">
              <span className="stat-value" style={{ color: "#0f172a" }}>{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: "#6366f1" }}>{stats.applied}</span>
              <span className="stat-label">Applied</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: "#f59e0b" }}>{stats.interviews}</span>
              <span className="stat-label">Interviews</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: "#10b981" }}>{stats.offers}</span>
              <span className="stat-label">Offers</span>
            </div>
          </div>

          {/* Filter pills */}
          <div className="mb-5" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span className="filter-group-label">Status</span>
            {pill("All", statusFilter === "All", () => setStatusFilter("All"), "status-")}
            {STATUSES.map((s) => pill(s, statusFilter === s, () => setStatusFilter(s), "status-"))}

            <div className="divider" />

            <span className="filter-group-label">Priority</span>
            {pill("All", priorityFilter === "All", () => setPriorityFilter("All"), "priority-")}
            {PRIORITIES.map((p) => pill(p, priorityFilter === p, () => setPriorityFilter(p), "priority-"))}

            {hasFilters && (
              <button
                onClick={() => { setQ(""); setStatusFilter("All"); setPriorityFilter("All"); }}
                style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          {/* Table card */}
          <Card className="dashboard-card shadow-small">
            <CardHeader className="dashboard-card-header">
              <p style={{ color: "#64748b", fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600, margin: 0 }}>
                Applications
                <span style={{ marginLeft: 8, color: "#94a3b8", fontWeight: 400 }}>({filtered.length})</span>
                {hasFilters && <span style={{ marginLeft: 8, color: "#6366f1", fontSize: 11, fontWeight: 600 }}>● filtered</span>}
              </p>
            </CardHeader>
            <CardBody>
              <ApplicationTable
                apps={filtered}
                onDelete={(id) => setApps((prev) => prev.filter((a) => a.id !== id))}
                onEdit={(app) => { setEditing(app); setOpen(true); }}
              />
            </CardBody>
          </Card>

          <AddApplicationModal
            isOpen={open}
            onClose={() => setOpen(false)}
            initial={editing}
            onSave={(app) => {
              setApps((prev) => {
                const exists = prev.some((p) => p.id === app.id);
                if (!exists) return [app, ...prev];
                return prev.map((p) => (p.id === app.id ? app : p));
              });
            }}
          />
        </main>
      </div>
    </AuthGate>
  );
}