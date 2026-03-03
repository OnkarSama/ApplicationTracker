"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { Card, CardBody, CardHeader } from "@heroui/react";
import type { JobApplication, ApplicationStatus, ApplicationPriority } from "@/components/dashboard/types";
import ApplicationTable from "@/components/dashboard/ApplicationTable";
import ApplicationTableHeader from "@/components/dashboard/ApplicationTableHeader";
import { AddApplicationModal } from "@/components/dashboard/AddApplicationModal";
import { loadApps, saveApps } from "@/lib/storage";
import { seedApps } from "@/lib/mockData";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [apps, setApps] = useState<JobApplication[]>([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<JobApplication | null>(null);

    useEffect(() => {
        const existing = loadApps();
        if (existing.length) setApps(existing);
        else { setApps(seedApps); saveApps(seedApps); }
    }, []);

    useEffect(() => { saveApps(apps); }, [apps]);

    const stats = useMemo(() => ({
        total:      apps.length,
        applied:    apps.filter((a) => a.status === "Applied").length,
        interviews: apps.filter((a) => a.status === "Interview").length,
        offers:     apps.filter((a) => a.status === "Offer").length,
    }), [apps]);

    const handleNewApplication = () => {
        router.push("/application/create");
    };

    return (
        <AuthGate>

            <div className="min-h-svh bg-background font-['DM_Sans',sans-serif]">
                <main className="max-w-7xl mx-auto p-6">

                    <ApplicationTableHeader
                        onNewApplication={handleNewApplication}
                        stats={stats}
                    />

                    <Card className="bg-foreground border border-slate-200 rounded-2xl shadow-sm">
                        <CardHeader className="border-table_border px-4.5 py-3.5">
                            <p className="text-table_subheading text-[13px] tracking-[0.04em] uppercase font-semibold m-0">
                                Applications
                                <span className="ml-2 text-table_subheading font-normal">({apps.length})</span>
                            </p>
                        </CardHeader>
                        <CardBody>
                            <ApplicationTable
                                apps={apps}
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