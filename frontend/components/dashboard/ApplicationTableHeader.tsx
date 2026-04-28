"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"] as const;
const PRIORITIES = ["Low", "Medium", "High"] as const;

type Status = typeof STATUSES[number] | "All";
type Priority = typeof PRIORITIES[number] | "All";

interface Stats {
    total: number;
    applied: number;
    interviews: number;
    offers: number;
}

interface Props {
    onNewApplication: () => void;
    stats: Stats;
}

export default function ApplicationTableHeader({ onNewApplication, stats }: Props) {
    const [statusFilter, setStatusFilter] = useState<Status>("All");
    const [priorityFilter, setPriorityFilter] = useState<Priority>("All");
    const [q, setQ] = useState("");

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
        <div>
            {/* Heading */}
            <div className="mb-6">
                <h1 className="font-['Sora',sans-serif] text-heading tracking-tight text-[30px] font-extrabold m-0">
                    {siteConfig.name}
                </h1>
                <p className="text-subheading mt-1 text-[15px]">
                    Track your job applications in one place.
                </p>
            </div>

            {/* Stat cards */}
            <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))" }}>
                <div className="bg-foreground border border-slate-200 dark:border-slate-500 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[28px] font-extrabold font-['Sora',sans-serif] leading-none text-primary">{stats.total}</span>
                    <span className="text-[11px] text-table_subheading font-semibold tracking-widest uppercase">Total</span>
                </div>
                <div className="bg-foreground border border-slate-200 dark:border-slate-500 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[28px] font-extrabold font-['Sora',sans-serif] leading-none text-secondary">{stats.applied}</span>
                    <span className="text-[11px] text-table_subheading font-semibold tracking-widest uppercase">Applied</span>
                </div>
                <div className="bg-foreground border border-slate-200 dark:border-slate-500 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[28px] font-extrabold font-['Sora',sans-serif] leading-none text-warning">{stats.interviews}</span>
                    <span className="text-[11px] text-table_subheading font-semibold tracking-widest uppercase">Interviews</span>
                </div>
                <div className="bg-foreground border border-slate-200 dark:border-slate-500 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[28px] font-extrabold font-['Sora',sans-serif] leading-none text-success">{stats.offers}</span>
                    <span className="text-[11px] text-table_subheading font-semibold tracking-widest uppercase">Offers</span>
                </div>
            </div>

            {/* Filter pills */}
            <div className="mb-5 flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase whitespace-nowrap">Status</span>
                {pill("All", statusFilter === "All", () => setStatusFilter("All"), "status-")}
                {STATUSES.map((s) => pill(s, statusFilter === s, () => setStatusFilter(s), "status-"))}

                <div className="w-px h-5 bg-slate-200 shrink-0" />

                <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase whitespace-nowrap">Priority</span>
                {pill("All", priorityFilter === "All", () => setPriorityFilter("All"), "priority-")}
                {PRIORITIES.map((p) => pill(p, priorityFilter === p, () => setPriorityFilter(p), "priority-"))}

                {hasFilters && (
                    <button
                        onClick={() => { setQ(""); setStatusFilter("All"); setPriorityFilter("All"); }}
                        className="ml-auto text-xs text-slate-400 bg-transparent border-none cursor-pointer font-semibold"
                    >
                        ✕ Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}