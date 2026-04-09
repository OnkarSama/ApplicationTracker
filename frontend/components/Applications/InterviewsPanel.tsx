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

function isWithinWeek(iso: string) {
    const t = new Date(iso).getTime();
    const now = Date.now();
    return t > now && t <= now + 7 * 24 * 60 * 60 * 1000;
}

function sortInterviews(list: Interview[]): Interview[] {
    return [...list].sort((a, b) => {
        const aTime = new Date(a.scheduled_at).getTime();
        const bTime = new Date(b.scheduled_at).getTime();
        const now = Date.now();
        const week = now + 7 * 24 * 60 * 60 * 1000;
        const bucket = (t: number) => {
            if (t > now && t <= week) return 0;
            if (t > week)            return 1;
            return 2;
        };
        const aBucket = bucket(aTime);
        const bBucket = bucket(bTime);
        if (aBucket !== bBucket) return aBucket - bBucket;
        return aBucket === 2 ? bTime - aTime : aTime - bTime;
    });
}

function TrashIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    );
}

function InterviewsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                    <div className="h-5 bg-foreground/[0.06] rounded w-1/2 mb-3" />
                    <div className="h-4 bg-foreground/[0.04] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-foreground/[0.04] rounded w-1/3" />
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/[0.07] border border-primary/20 flex items-center justify-center mb-5">
                <CalendarIcon />
            </div>
            <p className="text-heading font-bold text-base">No interviews scheduled</p>
            <p className="text-muted text-sm mt-1.5">Add your first interview above.</p>
        </div>
    );
}

function SectionLabel({ label, count }: { label: string; count: number }) {
    return (
        <div className="flex items-center gap-3 col-span-full mt-2 first:mt-0">
            <span className="font-mono text-xs tracking-[0.16em] uppercase text-muted font-semibold whitespace-nowrap">
                {label}
            </span>
            <span className="font-mono text-xs text-muted/60 bg-foreground/[0.04] border border-border rounded-full px-2 py-0.5">
                {count}
            </span>
            <div className="flex-1 h-px bg-border" />
        </div>
    );
}

function InterviewCard({ interview, onDelete, isDeleting, variant }: {
    interview: Interview;
    onDelete: () => void;
    isDeleting: boolean;
    variant: "thisweek" | "upcoming" | "past";
}) {
    const cardCls = {
        thisweek: "border-primary/40 dark:bg-primary/[0.04]",
        upcoming: "border-border",
        past:     "border-border opacity-75",
    }[variant];

    const badgeCls = {
        thisweek: "text-primary border-primary/40 bg-primary/[0.1]",
        upcoming: "text-primary/80 border-primary/25 bg-primary/[0.07]",
        past:     "text-muted border-border bg-foreground/[0.04]",
    }[variant];

    const badgeLabel = {
        thisweek: "This Week",
        upcoming: "Upcoming",
        past:     "Past",
    }[variant];

    return (
        <div className={`group relative bg-white dark:bg-card border-2 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-3 ${cardCls}`}>

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-base font-bold text-heading">{interview.interview_type}</span>
                    <span className={`font-mono text-[0.65rem] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full border font-semibold shrink-0 ${badgeCls}`}>
                        {badgeLabel}
                    </span>
                </div>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    title="Delete interview"
                    className="flex items-center justify-center p-2 bg-background border border-border rounded-xl text-muted hover:text-danger hover:border-danger/40 hover:bg-danger/[0.07] disabled:opacity-40 opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-all shrink-0"
                >
                    <TrashIcon />
                </button>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-muted">
                <CalendarIcon />
                <span className="font-mono text-sm tracking-wide">
                    {fmtScheduled(interview.scheduled_at)}
                </span>
            </div>

            {/* Notes */}
            {interview.notes && (
                <p className="text-sm text-text leading-relaxed">{interview.notes}</p>
            )}

            {/* Added */}
            <span className="font-mono text-xs text-muted/50 mt-auto pt-1">
                Added {fmt(interview.created_at)}
            </span>
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
                scheduled_at: new Date(scheduledAt).toISOString(),
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

    const inputCls = "w-full bg-white dark:bg-foreground/[0.04] border-2 border-border rounded-xl px-4 py-2.5 text-base text-text placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors";

    const sortedInterviews = sortInterviews(interviews);
    const thisWeekList = sortedInterviews.filter(i => isWithinWeek(i.scheduled_at));
    const upcomingList = sortedInterviews.filter(i => isUpcoming(i.scheduled_at) && !isWithinWeek(i.scheduled_at));
    const pastList     = sortedInterviews.filter(i => !isUpcoming(i.scheduled_at));

    return (
        <div className="flex flex-col gap-6 w-full">

            {/* ── Schedule form ── */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm w-full">
                <p className="font-mono text-xs tracking-[0.18em] uppercase text-muted mb-4">
                    Schedule Interview
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-muted tracking-wide uppercase">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                            {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-muted tracking-wide uppercase">
                            Date & Time <span className="text-danger">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={e => setScheduledAt(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-4">
                    <label className="text-sm font-semibold text-muted tracking-wide uppercase">
                        Notes <span className="text-muted/40 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Interviewer name, topics to prepare, etc."
                        rows={2}
                        className={`${inputCls} resize-none`}
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={!scheduledAt || createMutation.isPending}
                        className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {createMutation.isPending ? (
                            <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin inline-block" />
                        ) : <CalendarIcon />}
                        Add Interview
                    </button>
                </div>
            </div>

            {isLoading && <InterviewsSkeleton />}

            {isError && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm bg-danger/[0.07] border border-danger/25 text-danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Failed to load interviews. Please refresh.
                </div>
            )}

            {!isLoading && !isError && interviews.length === 0 && <EmptyState />}

            {/* Full-width single-column sections */}
            {sortedInterviews.length > 0 && (
                <div className="flex flex-col gap-8 w-full">

                    {/* This Week */}
                    {thisWeekList.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <SectionLabel label="This Week" count={thisWeekList.length} />
                            {thisWeekList.map(i => (
                                <InterviewCard key={i.id} interview={i} onDelete={() => deleteMutation.mutate(i.id)} isDeleting={deleteMutation.isPending} variant="thisweek" />
                            ))}
                        </div>
                    )}

                    {/* Upcoming */}
                    {upcomingList.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <SectionLabel label="Upcoming" count={upcomingList.length} />
                            {upcomingList.map(i => (
                                <InterviewCard key={i.id} interview={i} onDelete={() => deleteMutation.mutate(i.id)} isDeleting={deleteMutation.isPending} variant="upcoming" />
                            ))}
                        </div>
                    )}

                    {/* Past - stacked cards */}
                    {pastList.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <SectionLabel label="Past Interviews" count={pastList.length} />
                            <div className="flex flex-col">
                                {pastList.map((i, index) => (
                                    <div
                                        key={i.id}
                                        style={{
                                            marginTop: index === 0 ? 0 : "-0.875rem",
                                            zIndex: pastList.length - index,
                                            transform: `scale(${1 - index * 0.012})`,
                                            transformOrigin: "top center",
                                            position: "relative" as const,
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.transform = "scale(1) translateY(-3px)";
                                            el.style.zIndex = "999";
                                            el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.transform = `scale(${1 - index * 0.012})`;
                                            el.style.zIndex = String(pastList.length - index);
                                            el.style.boxShadow = "";
                                        }}
                                    >
                                        <InterviewCard interview={i} onDelete={() => deleteMutation.mutate(i.id)} isDeleting={deleteMutation.isPending} variant="past" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}