"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import type { Note } from "@/api/note";

interface NotesPanelProps {
    applicationId: number;
}

/* ── Timestamp helper ── */
function fmt(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

/* ── Icons ── */
function EditIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    );
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

/* ── Skeleton ── */
function NotesSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-card border border-border/30 rounded-2xl p-6 animate-pulse">
                    <div className="h-5 bg-foreground/[0.06] rounded w-3/4 mb-3" />
                    <div className="h-4 bg-foreground/[0.04] rounded w-1/3" />
                </div>
            ))}
        </div>
    );
}

/* ── Empty state ── */
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/[0.07] border border-primary/20 flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
            </div>
            <p className="text-heading font-bold text-base">No notes yet</p>
            <p className="text-muted text-sm mt-1.5">Add your first note above.</p>
        </div>
    );
}

export default function NotesPanel({ applicationId }: NotesPanelProps) {
    const queryClient = useQueryClient();

    const [newText, setNewText] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    const { data: notes = [], isLoading, isError } = useQuery<Note[]>({
        queryKey: ["notes", applicationId],
        queryFn: () => apiRouter.notes.getNotes(applicationId),
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["notes", applicationId] });

    const createMutation = useMutation({
        mutationFn: () => apiRouter.notes.createNote(applicationId, newText.trim()),
        onSuccess: () => { invalidate(); setNewText(""); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, content }: { id: number; content: string }) =>
            apiRouter.notes.updateNote(applicationId, id, content),
        onSuccess: () => { invalidate(); setEditingId(null); setEditText(""); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiRouter.notes.deleteNote(applicationId, id),
        onSuccess: invalidate,
    });

    const startEdit = (note: Note) => { setEditingId(note.id); setEditText(note.content); };
    const cancelEdit = () => { setEditingId(null); setEditText(""); };
    const submitEdit = (id: number) => {
        if (!editText.trim()) return;
        updateMutation.mutate({ id, content: editText.trim() });
    };

    const sortedNotes = [...notes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="flex flex-col gap-6">

            {/* ── Add note card ── */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm ring-1 ring-border/20">
                <p className="font-mono text-xs tracking-[0.18em] uppercase text-muted mb-3">
                    New Note
                </p>
                <textarea
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && newText.trim())
                            createMutation.mutate();
                    }}
                    placeholder="Write a note… (⌘ + Enter to save)"
                    rows={4}
                    className="w-full bg-white dark:bg-background border-2 border-border rounded-xl px-4 py-3 text-base text-text placeholder:text-muted/60 resize-none focus:outline-none focus:border-primary transition-colors leading-relaxed shadow-inner"
                />
                <div className="flex justify-end mt-3">
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={!newText.trim() || createMutation.isPending}
                        className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {createMutation.isPending ? (
                            <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin inline-block" />
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        )}
                        Add Note
                    </button>
                </div>
            </div>

            {/* ── States ── */}
            {isLoading && <NotesSkeleton />}

            {isError && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm bg-danger/[0.07] border border-danger/25 text-danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Failed to load notes. Please refresh.
                </div>
            )}

            {!isLoading && !isError && notes.length === 0 && <EmptyState />}

            {/* ── Stacked notes list ── */}
            {sortedNotes.length > 0 && (
                <div
                    className="relative flex flex-col"
                    /* total height accounts for the overlap so the container doesn't collapse */
                    style={{ paddingBottom: "0.75rem" }}
                >
                    {sortedNotes.map((note, index) => (
                        <div
                            key={note.id}
                            className="group relative bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm transition-all duration-200"
                            style={{
                                marginTop: index === 0 ? 0 : "-0.875rem",
                                zIndex: sortedNotes.length - index,
                                /* Subtle scale-down for cards further down the stack */
                                transform: `scale(${1 - index * 0.012})`,
                                transformOrigin: "top center",
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLDivElement;
                                el.style.transform = "scale(1) translateY(-3px)";
                                el.style.zIndex = "999";
                                el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLDivElement;
                                el.style.transform = `scale(${1 - index * 0.012})`;
                                el.style.zIndex = String(sortedNotes.length - index);
                                el.style.boxShadow = "";
                            }}
                        >
                            {editingId === note.id ? (
                                /* ── Edit mode ── */
                                <div className="flex flex-col gap-4">
                                    <textarea
                                        autoFocus
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitEdit(note.id);
                                            if (e.key === "Escape") cancelEdit();
                                        }}
                                        rows={4}
                                        className="w-full bg-white dark:bg-background border-2 border-primary/50 rounded-xl px-4 py-3 text-base text-text resize-none focus:outline-none focus:border-primary transition-colors leading-relaxed"
                                    />
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <span className="font-mono text-xs text-muted/60 tracking-wide">
                                            ⌘ + Enter to save · Esc to cancel
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={cancelEdit}
                                                className="text-sm px-4 py-2 rounded-xl border border-border text-muted hover:text-text hover:border-border/80 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => submitEdit(note.id)}
                                                disabled={!editText.trim() || updateMutation.isPending}
                                                className="text-sm px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/60 disabled:opacity-40 transition-all font-semibold"
                                            >
                                                {updateMutation.isPending ? "Saving…" : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ── Read mode ── */
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-2 min-w-0">
                                        <p className="text-base text-text leading-relaxed whitespace-pre-wrap break-words font-medium">
                                            {note.content}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs text-muted tracking-wide">
                                                {fmt(note.created_at)}
                                            </span>
                                            {note.updated_at !== note.created_at && (
                                                <span className="font-mono text-xs text-muted/60 tracking-wide">
                                                    · edited {fmt(note.updated_at)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions — always visible on mobile, hover on desktop */}
                                    <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(note)}
                                            title="Edit note"
                                            className="flex items-center justify-center p-2 bg-white dark:bg-background border border-border rounded-xl text-muted hover:text-primary hover:border-primary/40 hover:bg-primary/[0.07] transition-all"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(note.id)}
                                            disabled={deleteMutation.isPending}
                                            title="Delete note"
                                            className="flex items-center justify-center p-2 bg-white dark:bg-background border border-border rounded-xl text-muted hover:text-danger hover:border-danger/40 hover:bg-danger/[0.07] disabled:opacity-40 transition-all"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}