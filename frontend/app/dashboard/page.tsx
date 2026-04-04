"use client";

import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStatusSync } from "@/hooks/useStatusSync";

import { AuthGate } from "@/components/auth/AuthGate";
import ApplicationTable from "@/components/dashboard/ApplicationTable";
import ApplicationTableHeader from "@/components/dashboard/ApplicationTableHeader";
import { AddApplicationModal } from "@/components/dashboard/AddApplicationModal";
import EmptyDashboard from "@/components/dashboard/ZeroState";

import apiRouter from "@/api/router";
import type { Application } from "@/api/application";

export default function DashboardPage() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const q = searchParams.get("q") ?? "";

    const [createOpen,     setCreateOpen]     = useState(false);
    const [statusFilter,   setStatusFilter]   = useState("All");
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [isSyncing,      setIsSyncing]      = useState(false);

    const { data = [] as Application[], isLoading } = useQuery({
        queryKey: ["getApplications", q],
        queryFn:  () => apiRouter.applications.getApplications(q),
    });

    const filteredData = useMemo(() => {
        let result = data;
        if (statusFilter !== "All")  result = result.filter(a => a.status === statusFilter);
        if (priorityFilter !== null) result = result.filter(a => a.priority === priorityFilter);
        return result;
    }, [data, statusFilter, priorityFilter]);

    // Subscribe to ActionCable — toast + refetch fire only when scraping is fully done
    const handleSyncDone = useCallback(() => setIsSyncing(false), []);
    useStatusSync(handleSyncDone);

    const syncMutation = useMutation({
        mutationFn: () => apiRouter.applications.syncApplications(),
        onSuccess: () => setIsSyncing(true),
    });

    const stats = useMemo(() => ({
        total:      data.length,
        applied:    data.filter((a: Application) => a.status === "Applied").length,
        interviews: data.filter((a: Application) => a.status === "Interview").length,
        offers:     data.filter((a: Application) => a.status === "Offer").length,
    }), [data]);

    // True zero-state: user has no applications at all (not a search/filter miss)
    const isEmpty = !isLoading && data.length === 0 && !q && statusFilter === "All" && priorityFilter === null;
    const hasNoResults   = !isLoading && !isEmpty && filteredData.length === 0;

    return (
        <AuthGate>
            <div className="min-h-svh bg-background">
                <main className="w-[93%] mx-auto p-6">

                    <ApplicationTableHeader
                        onNewApplication={() => setCreateOpen(true)}
                        stats={stats}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        priorityFilter={priorityFilter}
                        onPriorityChange={setPriorityFilter}
                    />

                    <Card className="bg-card border border-border/40 rounded-2xl shadow-sm">
                        <CardHeader className="flex items-center justify-between border-b border-border/30 px-5 py-3.5">
                            <span className="text-muted text-[13px] tracking-[0.06em] uppercase font-semibold">
                                Applications
                            </span>
                            {!isEmpty && (
                                <Button
                                    size="sm"
                                    variant="bordered"
                                    isLoading={syncMutation.isPending || isSyncing}
                                    onPress={() => syncMutation.mutate()}
                                    className="border-border/50 text-muted hover:text-foreground hover:border-border text-xs"
                                >
                                    Sync Statuses
                                </Button>
                            )}
                        </CardHeader>
                        <CardBody>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                </div>
                            ) : isEmpty ? (
                                <EmptyDashboard />
                            ) : hasNoResults ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <span className="text-muted text-sm">No applications match your search or filters.</span>
                                </div>
                            ) : (
                                <ApplicationTable applications={filteredData} />
                            )}
                        </CardBody>
                    </Card>

                </main>
            </div>

            <AddApplicationModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
            />
        </AuthGate>
    );
}
