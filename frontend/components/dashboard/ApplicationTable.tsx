"use client";

import React, { useState } from "react";
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Pagination, SortDescriptor,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
} from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import { getPriorityOptions, getPriorityLabel } from "@/utils/priority";

import { Application } from "@/api/application";

interface Props {
    applications?: Application[];
}

const STATUSES   = ["Wishlist", "Applied", "Under Review", "Awaiting Decision", "Interview", "Offer", "Rejected"] as const;
const CATEGORIES = ["Internship", "Full-time", "Graduate School", "Fellowship", "Research", "Other"] as const;

const statusColorMap: Record<string, any> = {
    Wishlist:            "secondary",
    Applied:             "primary",
    "Under Review":      "warning",
    "Awaiting Decision": "warning",
    Interview:           "warning",
    Offer:               "success",
    Rejected:            "danger",
};

const categoryColorMap: Record<string, any> = {
    "Internship":      "secondary",
    "Full-time":       "primary",
    "Graduate School": "success",
    "Fellowship":      "warning",
    "Research":        "danger",
    "Other":           "default",
};

const priorityColorMap: Record<string, any> = {
    Low:    "default",
    Medium: "warning",
    High:   "danger",
};

export default function ApplicationTable({ applications = [] }: Props) {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const queryClient  = useQueryClient();

    const [quickEdit, setQuickEdit] = useState<Application | null>(null);
    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

    const rowsPerPage = 10;

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column:    "created_at",
        direction: "descending",
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            apiRouter.applications.updateApplication(id, { application: { status } as any }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getApplications"] }),
    });

    const priorityMutation = useMutation({
        mutationFn: ({ id, priority }: { id: number; priority: string }) =>
            apiRouter.applications.updateApplication(id, { application: { priority } as any }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getApplications"] }),
    });

    const sortedApps   = [...applications];
    const displayedApps = sortedApps.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const pages        = Math.max(1, Math.ceil(sortedApps.length / rowsPerPage));

    return (
        <>
            {/* QUICK EDIT PANEL */}
            {quickEdit && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setQuickEdit(null)}
                    />
                    <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border z-50 p-6 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{quickEdit.company}</h2>
                                {quickEdit.position && (
                                    <p className="text-sm text-muted mt-0.5">{quickEdit.position}</p>
                                )}
                            </div>
                            <a
                                href={`/application/${quickEdit.id}?${searchParams.toString()}`}
                                onClick={e => e.stopPropagation()}
                                className="text-xs text-primary hover:underline mt-1 shrink-0"
                            >
                                Full Edit →
                            </a>
                        </div>

                        {/* STATUS */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-muted/60 tracking-widest uppercase">Status</span>
                            <div className="flex flex-wrap gap-2">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setQuickEdit((p) => p && { ...p, status: s })}
                                        className={`px-3 py-1 rounded-lg text-xs border transition ${
                                            quickEdit.status === s
                                                ? "bg-primary/20 text-primary border-primary"
                                                : "border-border text-muted"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRIORITY */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-muted/60 tracking-widest uppercase">Priority</span>
                            <div className="flex gap-2">
                                {getPriorityOptions(quickEdit.category).map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setQuickEdit((prev) => prev ? { ...prev, priority: key } : prev)}
                                        className={`flex-1 py-2 rounded-lg text-xs border transition ${
                                            quickEdit.priority === key
                                                ? "bg-primary/20 border-primary text-primary"
                                                : "border-border text-muted"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SALARY */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-muted/60 tracking-widest uppercase">Salary</span>
                            <input
                                type="number"
                                min="0"
                                value={quickEdit.salary ?? ""}
                                onChange={e =>
                                    setQuickEdit(prev =>
                                        prev ? { ...prev, salary: e.target.value ? Number(e.target.value) : null } : prev
                                    )
                                }
                                placeholder="e.g. 85000"
                                className="w-full rounded-lg border border-border bg-foreground/[0.04] px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {/* CATEGORY */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-muted/60 tracking-widest uppercase">Category</span>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setQuickEdit((prev) => prev ? { ...prev, category: c } : prev)}
                                        className={`px-3 py-1 rounded-lg text-xs border transition ${
                                            quickEdit.category === c
                                                ? "bg-primary/20 text-primary border-primary"
                                                : "border-border text-muted"
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                apiRouter.applications
                                    .updateApplication(quickEdit.id, { application: quickEdit })
                                    .then(() => {
                                        queryClient.invalidateQueries({ queryKey: ["getApplications"] });
                                        setQuickEdit(null);
                                    });
                            }}
                            className="mt-auto bg-primary text-white py-2 rounded-lg text-sm font-semibold"
                        >
                            Save
                        </button>
                    </div>
                </>
            )}

            <Table
                removeWrapper
                isHeaderSticky
                className="bg-table_bg border border-table_border rounded-xl"
            >
                <TableHeader>
                    <TableColumn>Company</TableColumn>
                    <TableColumn>Position</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Priority</TableColumn>
                    <TableColumn>Category</TableColumn>
                    <TableColumn>Salary</TableColumn>
                    <TableColumn>Notes</TableColumn>
                    <TableColumn>Last Updated</TableColumn>
                </TableHeader>

                <TableBody items={displayedApps}>
                    {(app) => (
                        <TableRow
                            key={app.id}
                            onClick={() => setQuickEdit(app)}
                            className="cursor-pointer hover:bg-table_hover"
                        >
                            <TableCell className="text-table_text">{app.company}</TableCell>
                            <TableCell className="text-table_text">{app.position ?? "—"}</TableCell>

                            {/* STATUS — inline dropdown, stops row click */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <button>
                                            <Chip color={statusColorMap[app.status]}>{app.status}</Chip>
                                        </button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        onAction={(key) => statusMutation.mutate({ id: app.id, status: key as string })}
                                    >
                                        {STATUSES.map((s) => (
                                            <DropdownItem key={s}>{s}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            </TableCell>

                            {/* PRIORITY — inline dropdown, stops row click */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <button>
                                            <Chip color={priorityColorMap[app.priority] ?? "default"}>
                                                {getPriorityLabel(app.priority, app.category)}
                                            </Chip>
                                        </button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        onAction={(key) => priorityMutation.mutate({ id: app.id, priority: key as string })}
                                    >
                                        {getPriorityOptions(app.category).map(({ key, label }) => (
                                            <DropdownItem key={key}>{label}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            </TableCell>

                            <TableCell>
                                <Chip color={categoryColorMap[app.category]}>{app.category}</Chip>
                            </TableCell>

                            <TableCell className="text-table_text">
                                {app.salary != null ? `$${Number(app.salary).toLocaleString()}` : "—"}
                            </TableCell>

                            {/* NOTES — navigates to notes view, stops row click */}
                            <TableCell
                                className="text-table_text cursor-pointer hover:text-primary max-w-[160px] truncate"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/application/${app.id}/notes`);
                                }}
                            >
                                {app.notes?.at(-1)?.content ?? "—"}
                            </TableCell>

                            <TableCell className="text-table_text">
                                {new Date(app.updated_at).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="mt-4">
                <Pagination page={page} total={pages} onChange={setPage} />
            </div>
        </>
    );
}
