"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeyboardShortcutsContextValue {
    /** Open/close the New Application modal */
    openNewApp: boolean;
    setOpenNewApp: (v: boolean) => void;
    /** Ref to attach to the navbar search <input> */
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    /** ID of the currently hovered/selected table row */
    selectedAppId: number | null;
    setSelectedAppId: (id: number | null) => void;
    /** Table registers a delete callback; provider calls it on Del */
    deleteHandlerRef: React.MutableRefObject<((id: number) => void) | null>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export function useKeyboardShortcuts(): KeyboardShortcutsContextValue {
    const ctx = useContext(KeyboardShortcutsContext);
    if (!ctx) throw new Error("useKeyboardShortcuts must be used inside KeyboardShortcutsProvider");
    return ctx;
}

// ─── Shortcuts reference data ─────────────────────────────────────────────────

const SHORTCUTS: { keys: string[]; description: string }[] = [
    { keys: ["N"],           description: "Open new application modal" },
    { keys: ["/"],           description: "Focus search" },
    { keys: ["Ctrl", "K"],   description: "Focus search" },
    { keys: ["Del"],         description: "Delete hovered application" },
    { keys: ["Esc"],         description: "Close modal / overlay" },
    { keys: ["?"],           description: "Show this help overlay" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Returns true if the keyboard event originated from an interactive element */
function isTyping(e: KeyboardEvent): boolean {
    const target = e.target as HTMLElement;
    const tag = target.tagName;
    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
    );
}

/** Desktop only — skip if pointer is coarse (touch device) */
function isDesktop(): boolean {
    return typeof window !== "undefined" &&
        !window.matchMedia("(pointer: coarse)").matches;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
    const [openNewApp,    setOpenNewApp]    = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
    const [showHelp,      setShowHelp]      = useState(false);

    const searchInputRef  = useRef<HTMLInputElement | null>(null);
    const deleteHandlerRef = useRef<((id: number) => void) | null>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isDesktop()) return;

        const ctrl = e.ctrlKey || e.metaKey;

        // Ctrl+K / Meta+K — focus search (always, even when typing)
        if (ctrl && e.key === "k") {
            e.preventDefault();
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
            return;
        }

        // All remaining shortcuts must not fire when typing
        if (isTyping(e)) return;

        switch (e.key) {
            case "n":
            case "N":
                e.preventDefault();
                setOpenNewApp(true);
                break;

            case "/":
                e.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                break;

            case "Delete":
                if (selectedAppId !== null && deleteHandlerRef.current) {
                    e.preventDefault();
                    deleteHandlerRef.current(selectedAppId);
                }
                break;

            case "Escape":
                if (showHelp) {
                    e.preventDefault();
                    setShowHelp(false);
                }
                break;

            case "?":
                e.preventDefault();
                setShowHelp(prev => !prev);
                break;
        }
    }, [selectedAppId, showHelp]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <KeyboardShortcutsContext.Provider value={{
            openNewApp,
            setOpenNewApp,
            searchInputRef,
            selectedAppId,
            setSelectedAppId,
            deleteHandlerRef,
        }}>
            {children}

            {/* ── Help overlay ── */}
            {showHelp && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowHelp(false)}
                >
                    <div
                        className="relative w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <div className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-primary/60 border border-primary/15 bg-primary/[0.04] px-3 py-1 rounded-full mb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#6366f1] inline-block" />
                                    Keyboard Shortcuts
                                </div>
                                <p className="text-xs text-muted/60">Desktop only</p>
                            </div>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="text-muted/50 hover:text-muted transition-colors"
                                aria-label="Close"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Shortcut rows */}
                        <div className="flex flex-col gap-2">
                            {SHORTCUTS.map(({ keys, description }) => (
                                <div key={description} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                                    <span className="text-sm text-subheading">{description}</span>
                                    <div className="flex items-center gap-1">
                                        {keys.map((k, i) => (
                                            <React.Fragment key={k}>
                                                {i > 0 && <span className="text-muted/40 text-xs">+</span>}
                                                <kbd className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-md text-[11px] font-mono font-medium text-primary bg-primary/10 border border-primary/25">
                                                    {k}
                                                </kbd>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-[11px] text-muted/40 text-center">
                            Press <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-foreground/[0.06] border border-border/40">Esc</kbd> or click outside to close
                        </p>
                    </div>
                </div>
            )}
        </KeyboardShortcutsContext.Provider>
    );
}
