"use client";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Button, Input } from "@heroui/react";
import type { JobApplication, ApplicationStatus, ApplicationPriority } from "@/components/dashboard/types";
import ApplicationTable from "@/components/dashboard/ApplicationTable";
import ApplicationTableHeader from "@/components/dashboard/ApplicationTableHeader";
import { AddApplicationModal } from "@/components/dashboard/AddApplicationModal";
import { loadApps, saveApps } from "@/lib/storage";
import {siteConfig} from "@/config/site";
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
            className={[
              "px-3.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap transition-all duration-150 cursor-pointer",
              active
                  ? "border-indigo-500 bg-violet-100 text-indigo-500"
                  : "border-slate-200 bg-white text-slate-500",
            ].join(" ")}
        >
          {label}
        </button>
    );
  }

  return (
      <AuthGate>
        {/* Import fonts via a link tag in _document or layout, or keep a minimal style for @import only */}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

        <div className="min-h-svh bg-background font-['DM_Sans',sans-serif]">
          <main className="max-w-7xl mx-auto p-6">

              <ApplicationTableHeader
                  onNewApplication={() => console.log("New application clicked")}
                  stats={{ total: 24, applied: 18, interviews: 4, offers: 2 }}
              />

            {/* Table card */}
            <Card className="bg-foreground border border-slate-200 rounded-2xl shadow-sm">
              <CardHeader className="border-table_border px-4.5 py-3.5">
                <p className="text-table_subheading text-[13px] tracking-[0.04em] uppercase font-semibold m-0">
                  Applications
                  <span className="ml-2 text-table_subheading font-normal">({filtered.length})</span>
                  {hasFilters && <span className="ml-2 text-indigo-500 text-[11px] font-semibold">● filtered</span>}
                </p>
              </CardHeader>
              <CardBody>
                <ApplicationTable
                    apps={filtered}
                    onDelete={(id) => setApps((prev) => prev.filter((a) => a.id !== id))}
                    onEdit={(app) => { setEditing(app); setOpen(true); }}
                />
                {/*<ApplicationTable applications={data} />*/}
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
