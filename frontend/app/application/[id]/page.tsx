"use client";

import { use, useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiRouter from "@/api/router";
import { getPriorityOptions } from "@/utils/priority";

interface PageProps {
    params: Promise<{ id: string }>;
}

type FormState = {
    company: string;
    position: string;
    status: string;
    priority: string;
    category: string;
    salary: string;
};

const STATUS_OPTIONS   = ["Wishlist", "Applied", "Under Review", "Awaiting Decision", "Interview", "Offer", "Rejected"];
const CATEGORY_OPTIONS = ["Internship", "Full-time", "Graduate School", "Fellowship", "Research", "Other"];

const inputCN = {
    inputWrapper: "border-border/50 bg-foreground/[0.04] hover:border-primary/40 data-[focus=true]:border-primary/60",
    input:        "text-foreground text-sm",
    label:        "text-muted text-xs",
};

export default function EditApplicationPage({ params }: PageProps) {
    const { id } = use(params);
    const applicationId = Number(id);

    const router       = useRouter();
    const searchParams = useSearchParams();
    const queryClient  = useQueryClient();

    const [form, setForm] = useState<FormState>({
        company: "", position: "", status: "Applied", priority: "Low", category: "", salary: "",
    });

    /* ── Fetch ── */
    const { data: appData, isLoading, isError } = useQuery({
        queryKey: ["application", applicationId],
        queryFn: () => apiRouter.applications.getApplicationById(applicationId),
    });

    const application = appData?.application;

    useEffect(() => {
        if (!application) return;
        setForm({
            company:  application.company  || "",
            position: application.position || "",
            status:   application.status   || "Applied",
            priority: application.priority || "Low",
            category: application.category || "",
            salary:   application.salary != null ? String(application.salary) : "",
        });
    }, [application]);

    const isDirty = application && (
        form.company  !== (application.company  || "") ||
        form.position !== (application.position || "") ||
        form.status   !== (application.status   || "Applied") ||
        form.priority !== (application.priority || "Low") ||
        form.category !== (application.category || "") ||
        form.salary   !== (application.salary != null ? String(application.salary) : "")
    );

    /* ── Update ── */
    const updateMutation = useMutation({
        mutationFn: () =>
            apiRouter.applications.updateApplication(applicationId, {
                application: { ...form, salary: form.salary ? Number(form.salary) : null },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
            router.push(`/dashboard?${searchParams.toString()}`);
        },
    });

    /* ── Delete ── */
    const deleteMutation = useMutation({
        mutationFn: () => apiRouter.applications.deleteApplication(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
            router.push(`/dashboard?${searchParams.toString()}`);
        },
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateMutation.mutate();
    };

    const handleDelete = () => {
        if (!confirm(`Delete "${application?.company}"? This cannot be undone.`)) return;
        deleteMutation.mutate();
    };

    const handleReset = () => {
        router.push(`/dashboard?${searchParams.toString()}`);
    };

    /* ── Loading ── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-muted/40">Loading…</span>
                </div>
            </div>
        );
    }

    /* ── Error / Not found ── */
    if (isError || !application) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-heading font-semibold">Application not found</p>
                    <Link href="/dashboard" className="text-sm text-primary/70 hover:text-primary transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const isBusy = updateMutation.isPending || deleteMutation.isPending;

    return (
        <div className="min-h-screen bg-background">

            {/* ── Nav ── */}
            <nav className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 backdrop-blur-xl bg-background/80 border-b border-border/30 max-sm:px-4 max-sm:py-3.5">
                <Link
                    href={`/dashboard?${searchParams.toString()}`}
                    className="font-mono text-[0.78rem] tracking-[0.22em] uppercase text-primary/65 no-underline transition-colors duration-200 hover:text-primary"
                >
                    ← Dashboard
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/application/${id}/interviews`}
                        className="font-sans font-medium text-[0.84rem] px-5 py-2 rounded-md bg-foreground/[0.04] text-muted border border-border/40 no-underline transition-all duration-200 hover:text-foreground hover:border-border/70 max-sm:text-xs max-sm:px-3.5 max-sm:py-1.5"
                    >
                        Interviews
                    </Link>
                    <Link
                        href={`/application/${id}/notes`}
                        className="font-sans font-medium text-[0.84rem] px-5 py-2 rounded-md bg-foreground/[0.04] text-muted border border-border/40 no-underline transition-all duration-200 hover:text-foreground hover:border-border/70 max-sm:text-xs max-sm:px-3.5 max-sm:py-1.5"
                    >
                        Notes
                    </Link>
                </div>
            </nav>

            {/* ── Body ── */}
            <div className="max-w-2xl mx-auto px-8 pt-10 pb-16 max-sm:px-5 max-sm:pt-6">

                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-primary/55 border border-primary/12 bg-primary/[0.04] px-3 py-1 rounded-full mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_theme(colors.indigo.500)] inline-block" />
                        Edit Application
                    </div>
                    <h1 className="font-sora font-extrabold text-[clamp(1.4rem,4vw,2rem)] tracking-tight text-heading leading-tight m-0 truncate">
                        {application.company}
                    </h1>
                    {application.position && (
                        <p className="text-sm text-muted/70 mt-0.5">{application.position}</p>
                    )}
                    <p className="text-sm text-muted/50 mt-1.5">Update the details for this application.</p>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

                    <div className="flex flex-col gap-4 bg-card border border-border/40 rounded-2xl p-6">

                        {/* Company */}
                        <Input
                            isRequired
                            label="Company"
                            placeholder="e.g. Google"
                            value={form.company}
                            onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                            variant="bordered"
                            classNames={inputCN}
                        />

                        {/* Position */}
                        <Input
                            label="Position"
                            placeholder="e.g. Software Engineer Intern"
                            value={form.position}
                            onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                            variant="bordered"
                            classNames={inputCN}
                        />

                        {/* Status + Category */}
                        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                            <Select
                                label="Status"
                                variant="bordered"
                                selectedKeys={[form.status]}
                                onSelectionChange={keys =>
                                    setForm(p => ({ ...p, status: Array.from(keys)[0] as string }))
                                }
                                classNames={inputCN}
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <SelectItem key={s}>{s}</SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Category"
                                variant="bordered"
                                selectedKeys={form.category ? [form.category] : []}
                                onSelectionChange={keys =>
                                    setForm(p => ({ ...p, category: Array.from(keys)[0] as string }))
                                }
                                classNames={inputCN}
                            >
                                {CATEGORY_OPTIONS.map(c => (
                                    <SelectItem key={c}>{c}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Priority */}
                        <Select
                            label="Priority"
                            variant="bordered"
                            selectedKeys={[form.priority]}
                            onSelectionChange={keys =>
                                setForm(p => ({ ...p, priority: Array.from(keys)[0] as string }))
                            }
                            classNames={inputCN}
                        >
                            {getPriorityOptions(form.category).map(({ key, label }) => (
                                <SelectItem key={key}>{label}</SelectItem>
                            ))}
                        </Select>

                        {/* Salary */}
                        <Input
                            label="Salary"
                            placeholder="e.g. 85000"
                            type="number"
                            min="0"
                            value={form.salary}
                            onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                            variant="bordered"
                            classNames={inputCN}
                        />

                    </div>

                    {/* Error banner */}
                    {(updateMutation.isError || deleteMutation.isError) && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-danger/[0.07] border border-danger/22 text-danger/80">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            Something went wrong. Please try again.
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex gap-2.5">
                            <Button
                                type="submit"
                                isLoading={updateMutation.isPending}
                                isDisabled={!isDirty || isBusy}
                                variant="bordered"
                                className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary/20 hover:border-primary/55 font-bold tracking-wide disabled:opacity-40"
                            >
                                Save Changes
                            </Button>
                            <Button
                                type="button"
                                onPress={handleReset}
                                isDisabled={isBusy}
                                variant="bordered"
                                className="border-border/50 bg-foreground/[0.03] text-muted hover:bg-foreground/[0.07] hover:text-subheading hover:border-border font-medium tracking-wide disabled:opacity-30"
                            >
                                Discard
                            </Button>
                        </div>
                        <Button
                            type="button"
                            onPress={handleDelete}
                            isLoading={deleteMutation.isPending}
                            isDisabled={isBusy}
                            variant="bordered"
                            className="border-danger/30 bg-danger/[0.07] text-danger/80 hover:bg-danger/15 hover:border-danger/55 font-medium disabled:opacity-40"
                        >
                            Delete Application
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
