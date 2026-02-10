"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { NavbarTop } from "@/components/ui/NavbarTop";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";

import type { JobApplication } from "@/components/dashboard/types";
import { ApplicationTable } from "@/components/dashboard/ApplicationTable";
import { AddApplicationModal } from "@/components/dashboard/AddApplicationModal";
import { loadApps, saveApps } from "@/lib/storage";
import { seedApps } from "@/lib/mockData";

export default function DashboardPage() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);

  useEffect(() => {
    const existing = loadApps();
    if (existing.length) setApps(existing);
    else {
      setApps(seedApps);
      saveApps(seedApps);
    }
  }, []);

  useEffect(() => {
    saveApps(apps);
  }, [apps]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return apps;
    return apps.filter((a) => {
      return (
        a.company.toLowerCase().includes(s) ||
        a.role.toLowerCase().includes(s) ||
        a.status.toLowerCase().includes(s)
      );
    });
  }, [apps, q]);

  return (
    <AuthGate>
      <div className="min-h-[100svh] bg-default-50">
        <NavbarTop />

        <main className="mx-auto max-w-6xl p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p className="text-default-500">
                Track your job applications in one place.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Search company, role, status..."
                value={q}
                onValueChange={setQ}
                className="w-full md:w-[320px]"
              />
              <Button
                color="primary"
                onPress={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <Card className="shadow-small">
            <CardHeader>
              <p className="font-medium">Applications</p>
            </CardHeader>
            <CardBody>
              <ApplicationTable
                apps={filtered}
                onDelete={(id) => setApps((prev) => prev.filter((a) => a.id !== id))}
                onEdit={(app) => {
                  setEditing(app);
                  setOpen(true);
                }}
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
