"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem, addToast } from "@heroui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import apiRouter from "@/api/router";
import type { ApplicationPayload } from "@/api/application";

/* ── Shared primitives (same as create page) ─────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background font-['DM_Sans',sans-serif]">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
            <main className="max-w-2xl mx-auto px-4 py-10">{children}</main>
        </div>
    );
}

function FormCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-foreground border border-table_border rounded-2xl shadow-sm overflow-hidden">
            {children}
        </div>
    );
}

function FormSection({ children }: { children: React.ReactNode }) {
    return <div className="px-6 py-6 flex flex-col gap-5">{children}</div>;
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-table_subheading tracking-[0.08em] uppercase">{label}</label>
            {children}
            {hint && <p className="text-xs text-table_subheading opacity-70">{hint}</p>}
        </div>
    );
}

function StyledInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={[
                "w-full rounded-xl border border-table_border bg-background px-4 py-2.5 text-sm text-table_text",
                "placeholder:text-table_subheading placeholder:opacity-50",
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
                "w-full rounded-xl border border-table_border bg-background px-4 py-2.5 text-sm text-table_text",
                "placeholder:text-table_subheading placeholder:opacity-50",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                "transition-all duration-150 resize-none",
                props.className ?? "",
            ].join(" ")}
        />
    );
}

function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-xs text-table_subheading hover:text-table_text transition-colors mb-5 font-medium"
        >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 1L3 6l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {label}
        </Link>
    );
}

/* ── Delete confirmation modal ───────────────────────────── */
function DeleteModal({ title, onConfirm, onCancel, loading }: {
    title: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

            {/* Dialog */}
            <div className="relative bg-foreground border border-table_border rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-danger">
                            <path d="M9 6v4M9 12.5v.5M3.5 15.5h11a1 1 0 00.87-1.5L9.87 3a1 1 0 00-1.74 0L2.63 14a1 1 0 00.87 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-['Sora',sans-serif] font-bold text-[15px] text-table_text m-0 leading-tight">
                            Delete application?
                        </h2>
                        <p className="text-xs text-table_subheading mt-1.5 leading-relaxed">
                            <span className="font-semibold text-table_text">"{title}"</span> will be permanently removed. This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2.5">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-table_border text-table_subheading hover:text-table_text hover:border-primary/40 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-danger text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                        {loading ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────── */
interface PageProps { params: Promise<{ id: number }> }

export default function EditApplicationPage({ params }: PageProps) {
    const { id: appIdString } = use(params);
    const applicationId = Number(appIdString);

    const router       = useRouter();
    const searchParams = useSearchParams();
    const queryClient  = useQueryClient();

    const [submitting,     setSubmitting]     = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting,       setDeleting]       = useState(false);

    const [formState, setFormState] = useState<ApplicationPayload["application"]>({
        id: 0, title: "", notes: "", status: "Applied", priority: 0, category: "",
    });

    const { title, notes, status, priority, category } = formState;

    /* ── Fetch ── */
    const { data: appData, isLoading, refetch } = useQuery({
        queryKey: ["getApplicationById", applicationId],
        queryFn:  () => apiRouter.applications.getApplicationById(applicationId),
    });
    const application = appData?.application;

    useEffect(() => {
        if (!application) return;
        setFormState({
            id:       application.id,
            title:    application.title    || "",
            notes:    application.notes    || "",
            status:   application.status   || "Applied",
            priority: application.priority ?? 0,
            category: application.category || "",
        });
    }, [application]);

    /* ── Update ── */
    const updateMutation = useMutation({
        mutationFn: async (payload: typeof formState) =>
            apiRouter.applications.updateApplication(applicationId, { application: payload }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            refetch();
            setSubmitting(false);
            addToast({
                title:       "Changes saved",
                description: "Your application has been updated.",
                color:       "success",
                timeout:     3000,
                shouldShowTimeoutProgress: true,
            });
            router.push(`/dashboard?${searchParams.toString()}`);
        },
        onError: (err: any) => {
            setSubmitting(false);
            addToast({
                title:       "Update failed",
                description: err?.response?.data?.message ?? "Please try again.",
                color:       "danger",
                timeout:     4000,
                shouldShowTimeoutProgress: true,
            });
        },
    });

    /* ── Delete ── */
    const deleteMutation = useMutation({
        mutationFn: () => apiRouter.applications.deleteApplication(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            addToast({
                title:       "Application deleted",
                description: `"${application?.title}" has been removed.`,
                color:       "default",
                timeout:     3000,
                shouldShowTimeoutProgress: true,
            });
            router.push(`/dashboard?${searchParams.toString()}`);
        },
        onError: (err: any) => {
            setDeleting(false);
            setShowDeleteModal(false);
            addToast({
                title:       "Delete failed",
                description: err?.response?.data?.message ?? "Please try again.",
                color:       "danger",
                timeout:     4000,
                shouldShowTimeoutProgress: true,
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        updateMutation.mutate(formState);
    };

    const handleDeleteConfirm = () => {
        setDeleting(true);
        deleteMutation.mutate();
    };

    const handleReset = () => {
        if (!application) return;
        setFormState({
            title:    application.title    || "",
            notes:    application.notes    || "",
            status:   application.status   || "Applied",
            priority: application.priority ?? 0,
            category: application.category || "",
        });
    };

    /* ── Loading / not found ── */
    if (isLoading) {
        return (
            <PageShell>
                <div className="flex items-center gap-3 text-sm text-table_subheading py-20 justify-center">
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    Loading application…
                </div>
            </PageShell>
        );
    }

    if (!application) {
        return (
            <PageShell>
                <div className="text-center py-20">
                    <p className="text-table_subheading text-sm mb-4">Application not found.</p>
                    <Link href="/dashboard" className="text-primary text-sm font-medium hover:underline">
                        ← Back to dashboard
                    </Link>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            {showDeleteModal && (
                <DeleteModal
                    title={application.title || "this application"}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                    loading={deleting}
                />
            )}

            <BackLink href={`/dashboard?${searchParams.toString()}`} label="Back to dashboard" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-['Sora',sans-serif] text-heading font-extrabold text-[22px] tracking-tight m-0">
                        Edit Application
                    </h1>
                    <p className="text-table_subheading text-sm mt-1 truncate max-w-xs">
                        {application.title}
                    </p>
                </div>

                {/* Delete trigger — separated from main action to prevent accidents */}
                <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-danger/30 text-danger hover:bg-danger/10 transition-all duration-150 flex-shrink-0"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1.5 3h9M4.5 3V1.5h3V3M5 5.5v4M7 5.5v4M2 3l.75 7.5h6.5L10 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete
                </button>
            </div>

            <FormCard>
                <form onSubmit={handleSubmit}>
                    <FormSection>

                        <FieldGroup label="Title *">
                            <StyledInput
                                required
                                value={title}
                                onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. Google SWE Intern"
                            />
                        </FieldGroup>

                        {/* Status + Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FieldGroup label="Status">
                                <Select
                                    size="sm"
                                    selectedKeys={[status]}
                                    onSelectionChange={(k) => setFormState((p) => ({ ...p, status: Array.from(k)[0] as string }))}
                                    classNames={{ trigger: "rounded-xl border-table_border bg-background h-10", value: "text-sm text-table_text" }}
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
                                    onSelectionChange={(k) => setFormState((p) => ({ ...p, category: Array.from(k)[0] as string }))}
                                    classNames={{ trigger: "rounded-xl border-table_border bg-background h-10", value: "text-sm text-table_text" }}
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

                        {/* Priority — segmented control instead of dropdown */}
                        <FieldGroup label="Priority">
                            <div className="flex gap-2">
                                {[
                                    { key: 0, label: "Normal",    color: "text-table_subheading" },
                                    { key: 1, label: "Important", color: "text-warning"          },
                                    { key: 2, label: "Urgent",    color: "text-danger"           },
                                ].map(({ key, label, color }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFormState((p) => ({ ...p, priority: key }))}
                                        className={[
                                            "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-150",
                                            priority === key
                                                ? `border-primary bg-primary/10 ${color}`
                                                : "border-table_border bg-transparent text-table_subheading hover:border-primary/40",
                                        ].join(" ")}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </FieldGroup>

                        {/* Notes */}
                        <FieldGroup label="Notes">
                            <StyledTextarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setFormState((p) => ({ ...p, notes: e.target.value }))}
                                placeholder="Interview details, contacts, deadlines…"
                            />
                        </FieldGroup>

                    </FormSection>

                    {/* Footer */}
                    <div className="px-6 pb-6 pt-0 flex flex-col gap-2.5">
                        {/* Primary: Save */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className={[
                                "w-full py-3 rounded-xl text-sm font-bold transition-all duration-150",
                                "bg-primary text-primary-foreground",
                                "hover:opacity-90 active:scale-[0.99]",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "flex items-center justify-center gap-2",
                            ].join(" ")}
                        >
                            {submitting && <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />}
                            {submitting ? "Saving…" : "Save Changes"}
                        </button>

                        {/* Secondary: Reset */}
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={submitting}
                            className="w-full py-2.5 rounded-xl text-sm font-medium border border-table_border text-table_subheading hover:text-table_text hover:border-primary/40 transition-all disabled:opacity-40"
                        >
                            Reset to saved values
                        </button>
                    </div>
                </form>
            </FormCard>

            {/* Metadata footer */}
            {application.created_at && (
                <p className="text-center text-[11px] text-table_subheading mt-4 opacity-50">
                    Created {new Date(application.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
            )}
        </PageShell>
    );
}