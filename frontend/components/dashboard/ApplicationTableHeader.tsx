"use client";

import { siteConfig } from "@/config/site";

const STATUSES   = ["Wishlist", "Applied", "Under Review", "Awaiting Decision", "Interview", "Offer", "Rejected"] as const;
const PRIORITIES = ["Low", "Medium", "High"] as const;

interface Stats {
    total:      number;
    applied:    number;
    interviews: number;
    offers:     number;
}

interface Props {
    onNewApplication: () => void;
    stats:            Stats;
    statusFilter:     string;
    onStatusChange:   (s: string) => void;
    priorityFilter:   string | null;
    onPriorityChange: (p: string | null) => void;
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={[
                "px-3.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap transition-all duration-150 cursor-pointer",
                active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-foreground/[0.04] text-muted hover:border-primary/40 hover:text-foreground",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

export default function ApplicationTableHeader({
    onNewApplication,
    stats,
    statusFilter,
    onStatusChange,
    priorityFilter,
    onPriorityChange,
}: Props) {
    const hasFilters = statusFilter !== "All" || priorityFilter !== null;

    return (
        <div className="mb-6">

            {/* Heading row */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-sora text-heading tracking-tight text-[clamp(1.5rem,4vw,1.9rem)] font-extrabold m-0">
                        {siteConfig.name}
                    </h1>
                    <p className="text-subheading mt-1 text-[15px]">
                        Track your job applications in one place.
                    </p>
                </div>
                <button
                    onClick={onNewApplication}
                    className="flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/55 transition-all shrink-0 mt-1"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New Application
                </button>
            </div>

            {/* Stat cards */}
            <div className="mb-5 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))" }}>
                {[
                    { value: stats.total,      label: "Total",      color: "text-primary"    },
                    { value: stats.applied,    label: "Applied",    color: "text-secondary"  },
                    { value: stats.interviews, label: "Interviews", color: "text-warning"    },
                    { value: stats.offers,     label: "Offers",     color: "text-success"    },
                ].map(({ value, label, color }) => (
                    <div key={label} className="bg-card border border-border/40 rounded-xl px-5 py-4 flex flex-col gap-1">
                        <span className={`text-[28px] font-extrabold font-sora leading-none ${color}`}>{value}</span>
                        <span className="text-[11px] text-muted font-semibold tracking-widest uppercase">{label}</span>
                    </div>
                ))}
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-bold text-muted/60 tracking-widest uppercase whitespace-nowrap">Status</span>
                <Pill label="All"   active={statusFilter === "All"} onClick={() => onStatusChange("All")} />
                {STATUSES.map(s => (
                    <Pill key={s} label={s} active={statusFilter === s} onClick={() => onStatusChange(s)} />
                ))}

                <div className="w-px h-5 bg-border/50 shrink-0" />

                <span className="text-[11px] font-bold text-muted/60 tracking-widest uppercase whitespace-nowrap">Priority</span>
                <Pill label="All"   active={priorityFilter === null} onClick={() => onPriorityChange(null)} />
                {PRIORITIES.map(p => (
                    <Pill key={p} label={p} active={priorityFilter === p} onClick={() => onPriorityChange(p)} />
                ))}

                {hasFilters && (
                    <button
                        onClick={() => { onStatusChange("All"); onPriorityChange(null); }}
                        className="ml-auto text-xs text-muted/50 hover:text-muted cursor-pointer font-semibold transition-colors"
                    >
                        ✕ Clear all
                    </button>
                )}
            </div>
        </div>
    );
}
