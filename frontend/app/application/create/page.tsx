"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem, addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import apiRouter from "@/api/router";
import { getPriorityOptions } from "@/utils/priority";

export default function NewApplicationPage() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const queryClient  = useQueryClient();

    const [status,   setStatus]   = useState("Applied");
    const [priority, setPriority] = useState("Low");
    const [category, setCategory] = useState("");

    const createMutation = useMutation({
        mutationFn: ({ company, position }: { company: string; position: string }) =>
            apiRouter.applications.createApplication({
                application: {
                    company,
                    position: position || undefined,
                    status,
                    priority,
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
        const data = new FormData(e.currentTarget);
        const company = (data.get("company") as string).trim();
        const position = (data.get("position") as string).trim();
        if (!company) return;
        createMutation.mutate({ company, position });
    };

    const inputCls = [
        "w-full rounded-xl border border-border/50 bg-foreground/[0.04] px-4 py-2.5 text-sm text-foreground",
        "placeholder:text-muted/40",
        "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50",
        "transition-all duration-150",
    ].join(" ");

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-2xl mx-auto px-4 py-10">

                {/* Back */}
                <Link
                    href={`/dashboard?${searchParams.toString()}`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mb-6 font-medium"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M8 1L3 6l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to dashboard
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="font-sora text-heading font-extrabold text-2xl tracking-tight">
                        New Application
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Track a job, grad school, fellowship, or anything else.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-6 flex flex-col gap-5">

                            {/* Company */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted tracking-[0.08em] uppercase">
                                    Company <span className="text-danger">*</span>
                                </label>
                                <input
                                    required
                                    name="company"
                                    placeholder="e.g. Google · MIT · Rhodes Trust"
                                    className={inputCls}
                                />
                            </div>

                            {/* Position */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted tracking-[0.08em] uppercase">
                                    Position
                                </label>
                                <input
                                    name="position"
                                    placeholder="e.g. SWE Intern · MS Computer Science"
                                    className={inputCls}
                                />
                            </div>

                            {/* Status + Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-muted tracking-[0.08em] uppercase">Status</label>
                                    <Select
                                        size="sm"
                                        selectedKeys={[status]}
                                        onSelectionChange={(k) => setStatus(Array.from(k)[0] as string)}
                                        classNames={{
                                            trigger: "rounded-xl border-border/50 bg-foreground/[0.04] h-10",
                                            value:   "text-sm text-foreground",
                                        }}
                                        aria-label="Status"
                                    >
                                        <SelectItem key="Wishlist">Wishlist</SelectItem>
                                        <SelectItem key="Applied">Applied</SelectItem>
                                        <SelectItem key="Under Review">Under Review</SelectItem>
                                        <SelectItem key="Awaiting Decision">Awaiting Decision</SelectItem>
                                        <SelectItem key="Interview">Interview</SelectItem>
                                        <SelectItem key="Offer">Offer</SelectItem>
                                        <SelectItem key="Rejected">Rejected</SelectItem>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-muted tracking-[0.08em] uppercase">Category</label>
                                    <Select
                                        size="sm"
                                        selectedKeys={category ? [category] : []}
                                        onSelectionChange={(k) => setCategory(Array.from(k)[0] as string)}
                                        classNames={{
                                            trigger: "rounded-xl border-border/50 bg-foreground/[0.04] h-10",
                                            value:   "text-sm text-foreground",
                                        }}
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
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted tracking-[0.08em] uppercase">Priority</label>
                                <div className="flex gap-2">
                                    {getPriorityOptions(category).map(({ key, label, color }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setPriority(key)}
                                            className={[
                                                "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-150",
                                                priority === key
                                                    ? `border-primary/50 bg-primary/10 ${color}`
                                                    : "border-border/50 bg-transparent text-muted hover:border-primary/40 hover:text-foreground",
                                            ].join(" ")}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 pt-2 flex flex-col gap-3 border-t border-border/30">
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {createMutation.isPending && (
                                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                )}
                                {createMutation.isPending ? "Creating…" : "Create Application"}
                            </button>
                            <Link
                                href={`/dashboard?${searchParams.toString()}`}
                                className="text-center text-xs text-muted hover:text-foreground transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

            </main>
        </div>
    );
}
