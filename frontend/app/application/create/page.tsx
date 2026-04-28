"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem, addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import apiRouter from "@/api/router";

/* ── Shared form primitives ──────────────────────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background font-['DM_Sans',sans-serif]">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
            <main className="max-w-2xl mx-auto px-4 py-10">
                {children}
            </main>
        </div>
    );
}

function FormCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-foreground border border-table_border dark:border-slate-600 rounded-2xl shadow-sm overflow-hidden">
            {children}
        </div>
    );
}

function FormSection({ children }: { children: React.ReactNode }) {
    return <div className="px-6 py-6 flex flex-col gap-5">{children}</div>;
}

function FieldGroup({ label, hint, error, children }: {
    label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 dark:text-slate-700 tracking-[0.08em] uppercase">
                {label}
            </label>
            {children}
            {hint  && !error && <p className="text-xs text-slate-400 dark:text-slate-600 opacity-80">{hint}</p>}
            {error && <p className="text-xs text-danger font-medium">{error}</p>}
        </div>
    );
}

function StyledInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={[
                "w-full rounded-xl border border-table_border dark:border-slate-600 bg-background px-4 py-2.5 text-sm",
                "text-slate-800 dark:text-slate-200",
                "placeholder:text-slate-500 dark:placeholder:text-slate-600",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                "transition-all duration-150",
                props.className ?? "",
            ].join(" ")}
        />
    );
}

function StyledTextarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={[
                "w-full rounded-xl border border-table_border dark:border-slate-600 bg-background px-4 py-2.5 text-sm",
                "text-slate-800 dark:text-slate-200",
                "placeholder:text-slate-500 dark:placeholder:text-slate-600",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                "transition-all duration-150 resize-none",
                props.className ?? "",
            ].join(" ")}
        />
    );
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className={[
                "w-full py-3 rounded-xl text-sm font-bold transition-all duration-150",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 active:scale-[0.99]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2",
            ].join(" ")}
        >
            {loading && (
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            )}
            {loading ? loadingLabel : label}
        </button>
    );
}

function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-5 font-medium"
        >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 1L3 6l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {label}
        </Link>
    );
}

/* ── Page ────────────────────────────────────────────────── */
export default function NewApplicationPage() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const queryClient  = useQueryClient();

    const [submitting, setSubmitting] = useState(false);
    const [status,     setStatus]     = useState("Applied");
    const [priority,   setPriority]   = useState("0");
    const [category,   setCategory]   = useState("");

    const createMutation = useMutation({
        mutationFn: async (formData: Record<string, any>) =>
            apiRouter.applications.createApplication({
                application: {
                    title:    formData.title,
                    notes:    formData.notes,
                    status,
                    priority: Number(priority),
                    category,
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            addToast({
                title:       "Application created",
                description: "Your application has been saved.",
                color:       "success",
                timeout:     3000,
                shouldShowTimeoutProgress: true,
            });
            router.push(`/dashboard?${searchParams.toString()}`);
        },
        onError: (err: any) => {
            setSubmitting(false);
            addToast({
                title:       "Something went wrong",
                description: err?.response?.data?.message ?? "Please try again.",
                color:       "danger",
                timeout:     4000,
                shouldShowTimeoutProgress: true,
            });
        },
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = Object.fromEntries(new FormData(e.currentTarget));
        createMutation.mutate(formData);
    };

    return (
        <PageShell>
            <BackLink href={`/dashboard?${searchParams.toString()}`} label="Back to dashboard" />

            {/* Header */}
            <div className="mb-6">
                <h1 className="font-['Sora',sans-serif] text-slate-900 dark:text-white font-extrabold text-[22px] tracking-tight m-0">
                    New Application
                </h1>
                <p className="text-slate-700 dark:text-slate-400 text-sm mt-1">
                    Add a new application — job, grad school, fellowship, or anything else.
                </p>
            </div>

            <FormCard>
                <form onSubmit={handleSubmit}>
                    <FormSection>

                        <FieldGroup label="Title *" hint="Company name, program, or role">
                            <StyledInput
                                required
                                name="title"
                                placeholder="e.g. Google SWE Intern · MIT MS CS · Rhodes Scholarship"
                            />
                        </FieldGroup>

                        {/* Status + Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FieldGroup label="Status">
                                <Select
                                    size="sm"
                                    selectedKeys={[status]}
                                    onSelectionChange={(k) => setStatus(Array.from(k)[0] as string)}
                                    classNames={{ trigger: "rounded-xl border-table_border dark:border-slate-600 bg-background h-10", value: "text-sm text-slate-800 dark:text-slate-200" }}
                                    aria-label="Status"
                                >
                                    <SelectItem key="Wishlist">Wishlist</SelectItem>
                                    <SelectItem key="Applied">Applied</SelectItem>
                                    <SelectItem key="Interview">Interview</SelectItem>
                                    <SelectItem key="Offer">Offer</SelectItem>
                                    <SelectItem key="Rejected">Rejected</SelectItem>
                                </Select>
                            </FieldGroup>

                            <FieldGroup label="Category">
                                <Select
                                    size="sm"
                                    selectedKeys={category ? [category] : []}
                                    onSelectionChange={(k) => setCategory(Array.from(k)[0] as string)}
                                    classNames={{ trigger: "rounded-xl border-table_border dark:border-slate-600 bg-background h-10", value: "text-sm text-slate-800 dark:text-slate-200" }}
                                    aria-label="Category"
                                    placeholder="Select category"
                                >
                                    <SelectItem key="Internship">Internship</SelectItem>
                                    <SelectItem key="Full-time">Full-time</SelectItem>
                                    <SelectItem key="Graduate School">Graduate School</SelectItem>
                                    <SelectItem key="Fellowship">Fellowship</SelectItem>
                                    <SelectItem key="Research">Research</SelectItem>
                                    <SelectItem key="Other">Other</SelectItem>
                                </Select>
                            </FieldGroup>
                        </div>

                        {/* Priority */}
                        <FieldGroup label="Priority">
                            <div className="flex gap-2">
                                {[
                                    { key: "0", label: "Normal",    color: "text-slate-700 dark:text-slate-600" },
                                    { key: "1", label: "Important", color: "text-warning"                       },
                                    { key: "2", label: "Urgent",    color: "text-danger"                        },
                                ].map(({ key, label, color }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setPriority(key)}
                                        className={[
                                            "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-150",
                                            priority === key
                                                ? `border-primary bg-primary/10 ${color}`
                                                : "border-table_border dark:border-slate-600 bg-transparent text-slate-500 dark:text-slate-600 hover:border-primary/40",
                                        ].join(" ")}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </FieldGroup>

                        {/* Notes */}
                        <FieldGroup label="Notes" hint="Interview details, contacts, deadlines, requirements…">
                            <StyledTextarea
                                name="notes"
                                rows={4}
                                placeholder="Add any notes about this application…"
                            />
                        </FieldGroup>

                    </FormSection>

                    {/* Footer actions */}
                    <div className="px-6 pb-6 pt-0 flex flex-col gap-3">
                        <SubmitButton loading={submitting} label="Create Application" loadingLabel="Creating…" />
                        <Link
                            href={`/dashboard?${searchParams.toString()}`}
                            className="text-center text-xs text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </FormCard>
        </PageShell>
    );
}
