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

/* ── Icon: pencil ── */
function EditIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    );
}

/* ── Icon: trash ── */
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

/* ── Loading skeleton ── */
function NotesSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-card border border-border/30 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-foreground/[0.06] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-foreground/[0.04] rounded w-1/2" />
                </div>
            ))}
        </div>
    );
}

/* ── Empty state ── */
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/[0.07] border border-primary/20 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
            </div>
            <p className="text-heading font-semibold text-sm">No notes yet</p>
            <p className="text-muted/50 text-xs mt-1">Add your first note above.</p>
        </div>
    );
}

export default function NotesPanel({ applicationId }: NotesPanelProps) {
    const queryClient = useQueryClient();

    /* ── Add note state ── */
    const [newText, setNewText] = useState("");

    /* ── Edit state ── */
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    /* ── Fetch ── */
    const { data: notes = [], isLoading, isError } = useQuery<Note[]>({
        queryKey: ["notes", applicationId],
        queryFn: () => apiRouter.notes.getNotes(applicationId),
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["notes", applicationId] });

    /* ── Create ── */
    const createMutation = useMutation({
        mutationFn: () => apiRouter.notes.createNote(applicationId, newText.trim()),
        onSuccess: () => {
            invalidate();
            setNewText("");
        },
    });

    /* ── Update ── */
    const updateMutation = useMutation({
        mutationFn: ({ id, content }: { id: number; content: string }) =>
            apiRouter.notes.updateNote(applicationId, id, content),
        onSuccess: () => {
            invalidate();
            setEditingId(null);
            setEditText("");
        },
    });

    /* ── Delete ── */
    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiRouter.notes.deleteNote(applicationId, id),
        onSuccess: invalidate,
    });

    const startEdit = (note: Note) => {
        setEditingId(note.id);
        setEditText(note.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText("");
    };

    const submitEdit = (id: number) => {
        if (!editText.trim()) return;
        updateMutation.mutate({ id, content: editText.trim() });
    };

    return (
        <div className="flex flex-col gap-6">

            {/* ── Add note ── */}
            <div className="flex flex-col gap-3 bg-card border border-border/40 rounded-2xl p-5">
                <p className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-muted/50">New note</p>
                <textarea
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && newText.trim()) {
                            createMutation.mutate();
                        }
                    }}
                    placeholder="Write a note… (⌘ + Enter to save)"
                    rows={3}
                    className="w-full bg-foreground/[0.04] border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 resize-none focus:outline-none focus:border-primary/50 transition-colors"
                />
                <div className="flex justify-end">
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={!newText.trim() || createMutation.isPending}
                        className="flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/55 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {createMutation.isPending ? (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin inline-block" />
                        ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        )}
                        Add Note
                    </button>
                </div>
            </div>

            {/* ── Notes list ── */}
            <div className="flex flex-col gap-3">

                {isLoading && <NotesSkeleton />}

                {isError && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-danger/[0.07] border border-danger/22 text-danger/80">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Failed to load notes. Please refresh.
                    </div>
                )}

                {!isLoading && !isError && notes.length === 0 && <EmptyState />}

                {notes.map(note => (
                    <div
                        key={note.id}
                        className="group bg-card border border-border/30 rounded-xl p-4 transition-colors hover:border-border/60"
                    >
                        {editingId === note.id ? (
                            /* ── Edit mode ── */
                            <div className="flex flex-col gap-3">
                                <textarea
                                    autoFocus
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitEdit(note.id);
                                        if (e.key === "Escape") cancelEdit();
                                    }}
                                    rows={3}
                                    className="w-full bg-foreground/[0.04] border border-primary/40 rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/70 transition-colors"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[0.58rem] text-muted/35 tracking-[0.08em]">⌘ + Enter to save · Esc to cancel</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={cancelEdit}
                                            className="text-xs px-3 py-1.5 rounded-md border border-border/50 text-muted hover:text-foreground hover:border-border transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => submitEdit(note.id)}
                                            disabled={!editText.trim() || updateMutation.isPending}
                                            className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/55 disabled:opacity-40 transition-all"
                                        >
                                            {updateMutation.isPending ? "Saving…" : "Save"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── Read mode ── */
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">{note.content}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-[0.6rem] text-muted/40 tracking-[0.06em]">
                                            {fmt(note.created_at)}
                                        </span>
                                        {note.updated_at !== note.created_at && (
                                            <span className="font-mono text-[0.56rem] text-muted/30 tracking-[0.06em]">
                                                · edited {fmt(note.updated_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEdit(note)}
                                        title="Edit note"
                                        className="flex items-center justify-center p-1.5 bg-foreground/[0.04] border border-border/40 rounded-md text-muted/50 hover:text-primary hover:border-primary/30 hover:bg-primary/[0.07] transition-all"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={() => deleteMutation.mutate(note.id)}
                                        disabled={deleteMutation.isPending}
                                        title="Delete note"
                                        className="flex items-center justify-center p-1.5 bg-foreground/[0.04] border border-border/40 rounded-md text-muted/50 hover:text-danger hover:border-danger/30 hover:bg-danger/[0.07] disabled:opacity-40 transition-all"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
