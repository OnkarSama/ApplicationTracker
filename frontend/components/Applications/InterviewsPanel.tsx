"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";
import apiRouter from "@/api/router";
import type { Interview } from "@/api/interview";

interface InterviewsPanelProps {
    applicationId: number;
}

const INTERVIEW_TYPES = [
    "Phone Screen",
    "Technical",
    "Behavioral",
    "On-site",
    "Final Round",
    "Other",
];

function fmt(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function fmtScheduled(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function isUpcoming(iso: string) {
    return new Date(iso) > new Date();
}

/* Within the next 7 days */
function isWithinWeek(iso: string) {
    const t = new Date(iso).getTime();
    const now = Date.now();
    return t > now && t <= now + 7 * 24 * 60 * 60 * 1000;
}

/*
  Sort order:
    1. Upcoming within 7 days  → soonest first  (most urgent at top)
    2. Upcoming beyond 7 days  → soonest first
    3. Past interviews         → most recent first
*/
function sortInterviews(list: Interview[]): Interview[] {
    return [...list].sort((a, b) => {
        const aTime = new Date(a.scheduled_at).getTime();
        const bTime = new Date(b.scheduled_at).getTime();
        const now = Date.now();
        const week = now + 7 * 24 * 60 * 60 * 1000;

        const bucket = (t: number) => {
            if (t > now && t <= week) return 0;  // upcoming this week
            if (t > week)            return 1;   // upcoming later
            return 2;                             // past
        };

        const aBucket = bucket(aTime);
        const bBucket = bucket(bTime);

        if (aBucket !== bBucket) return aBucket - bBucket;

        // Within the same bucket:
        // upcoming → soonest first (ascending), past → most recent first (descending)
        return aBucket === 2 ? bTime - aTime : aTime - bTime;
    });
}

function TrashIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    );
}

function InterviewsSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
                <div key={i} className="bg-card border border-border/30 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-foreground/[0.06] rounded w-1/3 mb-2" />
                    <div className="h-3 bg-foreground/[0.04] rounded w-1/2" />
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/[0.07] border border-primary/20 flex items-center justify-center mb-4">
                <CalendarIcon />
            </div>
            <p className="text-heading font-semibold text-sm">No interviews scheduled</p>
            <p className="text-muted/50 text-xs mt-1">Add your first interview above.</p>
        </div>
    );
}

export default function InterviewsPanel({ applicationId }: InterviewsPanelProps) {
    const queryClient = useQueryClient();

    const [type, setType] = useState(INTERVIEW_TYPES[0]);
    const [scheduledAt, setScheduledAt] = useState("");
    const [notes, setNotes] = useState("");

    const { data: interviews = [], isLoading, isError } = useQuery<Interview[]>({
        queryKey: ["interviews", applicationId],
        queryFn: () => apiRouter.interviews.getInterviews(applicationId),
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["interviews", applicationId] });

    const createMutation = useMutation({
        mutationFn: () =>
            apiRouter.interviews.createInterview(applicationId, {
                interview_type: type,
                scheduled_at: scheduledAt,
                notes: notes.trim() || undefined,
            }),
        onSuccess: () => {
            invalidate();
            setScheduledAt("");
            setNotes("");
            addToast({ title: "Interview scheduled", color: "success", timeout: 3000, shouldShowTimeoutProgress: true });
        },
        onError: () => {
            addToast({ title: "Failed to schedule interview", color: "danger", timeout: 3000, shouldShowTimeoutProgress: true });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiRouter.interviews.deleteInterview(applicationId, id),
        onSuccess: invalidate,
    });

    const inputCls = "w-full bg-foreground/[0.04] border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/50 transition-colors";

    const sortedInterviews = sortInterviews(interviews);

    return (
        <div className="flex flex-col gap-6">

            {/* ── Add interview ── */}
            <div className="flex flex-col gap-4 bg-card border border-border/40 rounded-2xl p-5">
                <p className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-muted/50">Schedule interview</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Type */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted tracking-[0.08em] uppercase">Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className={inputCls}
                        >
                            {INTERVIEW_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date/time */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted tracking-[0.08em] uppercase">Date & Time <span className="text-danger">*</span></label>
                        <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={e => setScheduledAt(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted tracking-[0.08em] uppercase">Notes <span className="text-muted/40 font-normal normal-case">(optional)</span></label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Interviewer name, topics to prepare, etc."
                        rows={2}
                        className={`${inputCls} resize-none`}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={!scheduledAt || createMutation.isPending}
                        className="flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/55 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {createMutation.isPending ? (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin inline-block" />
                        ) : (
                            <CalendarIcon />
                        )}
                        Add Interview
                    </button>
                </div>
            </div>

            {/* ── List ── */}
            <div className="flex flex-col gap-3">
                {isLoading && <InterviewsSkeleton />}

                {isError && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-danger/[0.07] border border-danger/22 text-danger/80">
                        Failed to load interviews. Please refresh.
                    </div>
                )}

                {!isLoading && !isError && interviews.length === 0 && <EmptyState />}

                {sortedInterviews.map(interview => {
                    const upcoming = isUpcoming(interview.scheduled_at);
                    const thisWeek = isWithinWeek(interview.scheduled_at);
                    return (
                        <div
                            key={interview.id}
                            className={[
                                "group bg-card border rounded-xl p-4 transition-colors hover:border-border/60",
                                thisWeek
                                    ? "border-primary/30 bg-primary/[0.02]"  // highlight upcoming-this-week
                                    : "border-border/30",
                            ].join(" ")}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-foreground">{interview.interview_type}</span>
                                        {/* Status badge */}
                                        <span className={[
                                            "font-mono text-[0.58rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border",
                                            thisWeek
                                                ? "text-primary border-primary/40 bg-primary/[0.1]"
                                                : upcoming
                                                    ? "text-primary/80 border-primary/25 bg-primary/[0.07]"
                                                    : "text-muted/50 border-border/40 bg-foreground/[0.03]",
                                        ].join(" ")}>
                                            {thisWeek ? "This week" : upcoming ? "Upcoming" : "Past"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted/60">
                                        <CalendarIcon />
                                        <span className="font-mono text-[0.68rem] tracking-[0.04em]">
                                            {fmtScheduled(interview.scheduled_at)}
                                        </span>
                                    </div>
                                    {interview.notes && (
                                        <p className="text-xs text-muted/60 leading-relaxed mt-0.5">{interview.notes}</p>
                                    )}
                                    <span className="font-mono text-[0.56rem] text-muted/30 tracking-[0.04em]">
                                        Added {fmt(interview.created_at)}
                                    </span>
                                </div>

                                {/* Delete — always visible on small screens, hover-only on desktop */}
                                <button
                                    onClick={() => deleteMutation.mutate(interview.id)}
                                    disabled={deleteMutation.isPending}
                                    title="Delete interview"
                                    className="flex items-center justify-center p-1.5 bg-foreground/[0.04] border border-border/40 rounded-md text-muted/50 hover:text-danger hover:border-danger/30 hover:bg-danger/[0.07] disabled:opacity-40 opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-all shrink-0"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}