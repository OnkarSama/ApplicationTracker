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
    "Phone Screen", "Technical", "Behavioral", "On-site", "Final Round", "Other",
];

function fmt(iso: string) {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function fmtScheduled(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        weekday: "short", month: "short", day: "numeric",
        year: "numeric", hour: "numeric", minute: "2-digit",
    });
}

function isUpcoming(iso: string) { return new Date(iso) > new Date(); }

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

/* ── Icons ── */
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

function ChevronIcon({ expanded }: { expanded: boolean }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
             style={{ transition: "transform 0.3s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    );
}

/* ── Skeleton ── */
function InterviewsSkeleton() {
    return (
        <div className="flex flex-col gap-4 w-full">
            {[1, 2].map(i => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse w-full">
                    <div className="h-5 bg-foreground/[0.06] rounded w-1/2 mb-3" />
                    <div className="h-4 bg-foreground/[0.04] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-foreground/[0.04] rounded w-1/3" />
                </div>
            ))}
        </div>
    );
}

/* ── Empty state ── */
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center w-full">
            <div className="w-16 h-16 rounded-full bg-primary/[0.07] border border-primary/20 flex items-center justify-center mb-5">
                <CalendarIcon />
            </div>
            <p className="text-heading font-bold text-base">No interviews scheduled</p>
            <p className="text-muted text-sm mt-1.5">Add your first interview above.</p>
        </div>
    );
}

/* ── Single interview card ── */
function InterviewCard({ interview, onDelete, isDeleting, variant, index, total }: {
    interview: Interview;
    onDelete: () => void;
    isDeleting: boolean;
    variant: "thisweek" | "upcoming" | "past";
    index?: number;
    total?: number;
}) {
    const isPast = variant === "past";
    const idx = index ?? 0;
    const tot = total ?? 1;

    const cardCls = {
        thisweek: "border-primary/40 dark:bg-primary/[0.04]",
        upcoming: "border-border",
        past:     "border-border",
    }[variant];

    const badgeCls = {
        thisweek: "text-primary border-primary/40 bg-primary/[0.1]",
        upcoming: "text-primary/80 border-primary/25 bg-primary/[0.07]",
        past:     "text-muted border-border bg-foreground/[0.04]",
    }[variant];

    const badgeLabel = { thisweek: "This Week", upcoming: "Upcoming", past: "Past" }[variant];

    return (
        <div
            className={`group relative bg-white dark:bg-card border-2 rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col gap-3 w-full ${cardCls} ${!isPast ? "hover:shadow-md hover:-translate-y-0.5" : ""}`}
            style={isPast ? {
                marginTop: idx === 0 ? 0 : "-0.875rem",
                zIndex: tot - idx,
                transform: `scale(${1 - idx * 0.012})`,
                transformOrigin: "top center",
            } : undefined}
            onMouseEnter={isPast ? e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "scale(1) translateY(-3px)";
                el.style.zIndex = "999";
                el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
            } : undefined}
            onMouseLeave={isPast ? e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = `scale(${1 - idx * 0.012})`;
                el.style.zIndex = String(tot - idx);
                el.style.boxShadow = "";
            } : undefined}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-base font-bold text-foreground">{interview.interview_type}</span>
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
            <div className="flex items-center gap-2 text-subheading">
                <CalendarIcon />
                <span className="font-mono text-sm tracking-wide">{fmtScheduled(interview.scheduled_at)}</span>
            </div>
            {interview.notes && (
                <p className="text-sm text-foreground leading-relaxed">{interview.notes}</p>
            )}
            <span className="font-mono text-xs text-muted mt-auto pt-1">Added {fmt(interview.created_at)}</span>
        </div>
    );
}

/* ── Main ── */
export default function InterviewsPanel({ applicationId }: InterviewsPanelProps) {
    const queryClient = useQueryClient();

    const [type, setType]               = useState(INTERVIEW_TYPES[0]);
    const [scheduledAt, setScheduledAt] = useState("");
    const [notes, setNotes]             = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [upcomingExpanded, setUpcomingExpanded] = useState(true);
    const [pastExpanded, setPastExpanded]         = useState(false);

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

    const inputCls = "w-full bg-white dark:bg-foreground/[0.04] border-2 border-border rounded-xl px-4 py-2.5 text-base text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors";

    const sortedInterviews = sortInterviews(interviews);

    /* Search filters on interview_type and notes */
    const filteredInterviews = searchQuery.trim()
        ? sortedInterviews.filter(i =>
            i.interview_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.notes ?? "").toLowerCase().includes(searchQuery.toLowerCase())
        )
        : sortedInterviews;

    const thisWeekList = filteredInterviews.filter(i => isWithinWeek(i.scheduled_at));
    const upcomingList = filteredInterviews.filter(i => isUpcoming(i.scheduled_at) && !isWithinWeek(i.scheduled_at));
    const pastList     = filteredInterviews.filter(i => !isUpcoming(i.scheduled_at));

    const upcomingCombined = [...thisWeekList, ...upcomingList]; // left column
    const hasAny = filteredInterviews.length > 0;

    return (
        <div className="flex flex-col gap-6 w-full">

            {/* ── Schedule form ── */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm w-full">
                <p className="font-mono text-xs tracking-[0.18em] uppercase text-subheading mb-4">
                    Schedule Interview
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-subheading tracking-wide uppercase">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className={`${inputCls} text-foreground`}>
                            {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-subheading tracking-wide uppercase">
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
                    <label className="text-sm font-semibold text-subheading tracking-wide uppercase">
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
                        className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl bg-primary text-white border border-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {createMutation.isPending ? (
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                        ) : <CalendarIcon />}
                        Add Interview
                    </button>
                </div>
            </div>

            {/* ── Search bar ── */}
            {interviews.length > 0 && (
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search interviews by type or notes…"
                        className="w-full bg-white dark:bg-background border-2 border-border rounded-xl pl-10 pr-10 py-3 text-base text-text placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-4 flex items-center text-muted hover:text-foreground transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {isLoading && <InterviewsSkeleton />}

            {isError && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm bg-danger/[0.07] border border-danger/25 text-danger w-full">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Failed to load interviews. Please refresh.
                </div>
            )}

            {!isLoading && !isError && interviews.length === 0 && !searchQuery && <EmptyState />}

            {/* Search no results */}
            {searchQuery && !isLoading && filteredInterviews.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                    <div className="w-12 h-12 rounded-full bg-foreground/[0.05] border border-border flex items-center justify-center mb-4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </div>
                    <p className="text-heading font-semibold text-sm">No interviews match</p>
                    <p className="text-muted text-xs mt-1">Try a different search term.</p>
                </div>
            )}

            {/* ── TWO COLUMN LAYOUT: Upcoming LEFT, Past RIGHT ── */}
            {hasAny && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">

                    {/* ── LEFT: This Week + Upcoming — chevron on left ── */}
                    {upcomingCombined.length > 0 && (
                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setUpcomingExpanded(v => !v)}
                                    className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] uppercase text-subheading font-semibold hover:text-primary transition-colors shrink-0"
                                >
                                    <ChevronIcon expanded={upcomingExpanded} />
                                    Upcoming
                                </button>
                                <span className="font-mono text-xs text-muted/60 bg-foreground/[0.04] border border-border rounded-full px-2 py-0.5 shrink-0">
                                    {upcomingCombined.length}
                                </span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {upcomingExpanded && (
                                <div className="flex flex-col gap-3 w-full">
                                    {/* This week first */}
                                    {thisWeekList.map(i => (
                                        <InterviewCard
                                            key={i.id}
                                            interview={i}
                                            onDelete={() => deleteMutation.mutate(i.id)}
                                            isDeleting={deleteMutation.isPending}
                                            variant="thisweek"
                                        />
                                    ))}
                                    {/* Then upcoming beyond this week */}
                                    {upcomingList.map(i => (
                                        <InterviewCard
                                            key={i.id}
                                            interview={i}
                                            onDelete={() => deleteMutation.mutate(i.id)}
                                            isDeleting={deleteMutation.isPending}
                                            variant="upcoming"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── RIGHT: Past — chevron on right, same collapse as Upcoming ── */}
                    {pastList.length > 0 && (
                        <div className="flex flex-col gap-3 w-full">
                            {/* Header — chevron on right */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-border" />
                                <span className="font-mono text-xs text-muted/60 bg-foreground/[0.04] border border-border rounded-full px-2 py-0.5 shrink-0">
                                    {pastList.length}
                                </span>
                                <button
                                    onClick={() => setPastExpanded(v => !v)}
                                    className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] uppercase text-subheading font-semibold hover:text-primary transition-colors shrink-0"
                                >
                                    Past
                                    <ChevronIcon expanded={pastExpanded} />
                                </button>
                            </div>

                            {/* Collapsed = nothing shown (same as Upcoming) */}
                            {pastExpanded && (
                                <div className="flex flex-col w-full">
                                    {pastList.map((interview, index) => (
                                        <InterviewCard
                                            key={interview.id}
                                            interview={interview}
                                            onDelete={() => deleteMutation.mutate(interview.id)}
                                            isDeleting={deleteMutation.isPending}
                                            variant="past"
                                            index={index}
                                            total={pastList.length}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}