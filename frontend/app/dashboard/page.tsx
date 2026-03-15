"use client";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { Card, CardBody, CardHeader } from "@heroui/react";
import type {ApplicationStatus, ApplicationPriority } from "@/components/dashboard/types";
import ApplicationTable from "@/components/dashboard/ApplicationTable";
import ApplicationTableHeader from "@/components/dashboard/ApplicationTableHeader";
import { AddApplicationModal } from "@/components/dashboard/AddApplicationModal";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiRouter from "@/api/router";

import type {Application} from "@/api/application";


const STATUSES: ApplicationStatus[] = ["Applied", "Interview", "Offer", "Rejected", "Wishlist"];
const PRIORITIES: ApplicationPriority[] = ["High", "Medium", "Low"];

export default function DashboardPage() {

    const router = useRouter();

    const searchParams = useSearchParams();
    const q = searchParams.get("q") ?? "";

    const { data = [] as Application[], isLoading, error } = useQuery({
        queryKey: ["getApplications", q],
        queryFn: () => apiRouter.applications.getApplications(q),
    });

    const handleNewApplication = () => {
        router.push("/application/create");
    };


    const stats = useMemo(() => ({
        total:      data.length,
        applied:    data.filter((a: Application) => a.status === "Applied").length,
        interviews: data.filter((a: Application) => a.status === "Interview").length,
        offers:     data.filter((a: Application) => a.status === "Offer").length,
    }), [data]);


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
                        stats={stats}
                    />

                    {/* Table card */}
                    <Card className="bg-foreground border border-slate-200 rounded-2xl shadow-sm">
                        <CardHeader className="border-table_border px-4.5 py-3.5">
                            <p className="text-table_subheading text-[13px] tracking-[0.04em] uppercase font-semibold m-0">
                                Applications
                                {/*<span className="ml-2 text-table_subheading font-normal">({filtered.length})</span>*/}
                                {/*{hasFilters && <span className="ml-2 text-indigo-500 text-[11px] font-semibold">● filtered</span>}*/}
                            </p>
                        </CardHeader>
                        <CardBody>
                            <ApplicationTable applications={data}/>
                        </CardBody>
                    </Card>

                    {/*<AddApplicationModal*/}
                    {/*    isOpen={open}*/}
                    {/*    onClose={() => setOpen(false)}*/}
                    {/*    initial={editing}*/}
                    {/*    onSave={(app) => {*/}
                    {/*        setApps((prev) => {*/}
                    {/*            const exists = prev.some((p) => p.id === app.id);*/}
                    {/*            if (!exists) return [app, ...prev];*/}
                    {/*            return prev.map((p) => (p.id === app.id ? app : p));*/}
                    {/*        });*/}
                    {/*    }}*/}
                    {/*/>*/}
                </main>
            </div>
        </AuthGate>
    );
}