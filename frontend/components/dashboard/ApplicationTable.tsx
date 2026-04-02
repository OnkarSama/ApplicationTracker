"use client";

import React, { useState } from "react";
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Pagination, SortDescriptor,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button,
} from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRouter from "@/api/router";

import {Application} from "@/api/application";

interface Props {
    applications?: Application[];
}

const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Wishlist"] as const;
const CATEGORIES = ["Internship", "Full-time", "Graduate School", "Fellowship", "Research", "Other"] as const;

const statusColorMap: Record<string, any> = {
    Applied: "primary",
    Interview: "warning",
    Offer: "success",
    Rejected: "danger",
    Wishlist: "secondary",
};

const categoryColorMap: Record<string, any> = {
    "Internship": "secondary",
    "Full-time": "primary",
    "Graduate School": "success",
    "Fellowship": "warning",
    "Research": "danger",
    "Other": "default",
};

const priorityMap: Record<number, { label: string; color: any }> = {
    0: { label: "Normal", color: "default" },
    1: { label: "Important", color: "warning" },
    2: { label: "Urgent", color: "danger" },
};

export default function ApplicationTable({ applications = [] }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [quickEdit, setQuickEdit] = useState<Application | null>(null);

    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
    const rowsPerPage = 10;

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "created_at",
        direction: "descending",
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            apiRouter.applications.updateApplication(id, {
                application: { status } as any,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
        },
    });

    const sortedApps = [...applications];

    const displayedApps = sortedApps.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const pages = Math.max(1, Math.ceil(sortedApps.length / rowsPerPage));

    const goToApp = (id: number) => {
        router.push(`/application/${id}?${searchParams.toString()}`);
    };

    return (
        <>
            {/* QUICK EDIT */}
            {quickEdit && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setQuickEdit(null)}
                    />
                    <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border z-50 p-6 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-foreground">
                            {quickEdit.title}
                        </h2>

                        {/* STATUS */}
                        <div className="flex flex-wrap gap-2">
                            {STATUSES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() =>
                                        setQuickEdit((p) => p && { ...p, status: s })
                                    }
                                    className={`px-3 py-1 rounded-lg text-xs border transition
                                    ${
                                        quickEdit.status === s
                                            ? "bg-primary/20 text-primary border-primary"
                                            : "border-border text-muted"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* PRIORITY */}
                        <div className="flex gap-2">
                            {[0, 1, 2].map((p) => (
                                <button
                                    key={p}
                                    onClick={() =>
                                        setQuickEdit((prev) =>
                                            prev ? { ...prev, priority: p } : prev
                                        )
                                    }
                                    className={`flex-1 py-2 rounded-lg text-xs border
                                    ${
                                        quickEdit.priority === p
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "border-border text-muted"
                                    }`}
                                >
                                    {priorityMap[p].label}
                                </button>
                            ))}
                        </div>

                        {/* SALARY */}
                        <input
                            type="number"
                            min="0"
                            value={quickEdit.salary ?? ""}
                            onChange={e =>
                                setQuickEdit(prev =>
                                    prev ? { ...prev, salary: e.target.value ? Number(e.target.value) : null } : prev
                                )
                            }
                            placeholder="Salary (e.g. 85000)"
                            className="w-full rounded-lg border border-border bg-foreground/[0.04] px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/50 transition-colors"
                        />

                        {/* CATEGORY */}
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() =>
                                        setQuickEdit((prev) =>
                                            prev ? { ...prev, category: c } : prev
                                        )
                                    }
                                    className={`px-3 py-1 rounded-lg text-xs border transition
                                    ${
                                        quickEdit.category === c
                                            ? "bg-primary/20 text-primary border-primary"
                                            : "border-border text-muted"
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                apiRouter.applications
                                    .updateApplication(quickEdit.id, {
                                        application: quickEdit,
                                    })
                                    .then(() => {
                                        queryClient.invalidateQueries({
                                            queryKey: ["getApplications"],
                                        });
                                        setQuickEdit(null);
                                    });
                            }}
                            className="bg-primary text-white py-2 rounded-lg"
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
                    <TableColumn>Title</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Priority</TableColumn>
                    <TableColumn>Category</TableColumn>
                    <TableColumn>Salary</TableColumn>
                    <TableColumn>Notes</TableColumn>
                    <TableColumn>Last Updated</TableColumn>
                    <TableColumn>{""}</TableColumn>
                    <TableColumn>{""}</TableColumn>
                </TableHeader>

                <TableBody items={displayedApps}>
                    {(app) => (
                        <TableRow
                            key={app.id}
                            onClick={() => goToApp(app.id)}
                            className="cursor-pointer hover:bg-table_hover"
                        >
                            <TableCell className="text-table_text">
                                {app.title}
                            </TableCell>

                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <button>
                                            <Chip color={statusColorMap[app.status]}>
                                                {app.status}
                                            </Chip>
                                        </button>
                                    </DropdownTrigger>

                                    <DropdownMenu
                                        onAction={(key) =>
                                            statusMutation.mutate({
                                                id: app.id,
                                                status: key as string,
                                            })
                                        }
                                    >
                                        {STATUSES.map((s) => (
                                            <DropdownItem key={s}>{s}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            </TableCell>

                            <TableCell>
                                <Chip color={priorityMap[app.priority].color}>
                                    {priorityMap[app.priority].label}
                                </Chip>
                            </TableCell>

                            <TableCell>
                                <Chip color={categoryColorMap[app.category]}>{app.category}</Chip>
                            </TableCell>

                            <TableCell className="text-table_text">
                                {app.salary != null ? `$${Number(app.salary).toLocaleString()}` : "—"}
                            </TableCell>

                            <TableCell className="text-table_text max-w-50">
                                <span className="line-clamp-2 text-sm" title={app.notes?.at(-1)?.content ?? undefined}>
                                    {app.notes?.at(-1)?.content ?? "—"}
                                </span>
                            </TableCell>

                            <TableCell className="text-table_text">
                                {new Date(app.updated_at).toLocaleDateString()}
                            </TableCell>

                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Button
                                    onPress={() => setQuickEdit(app)}
                                    className="text-xs text-muted hover:text-primary"
                                >
                                    Edit
                                </Button>
                            </TableCell>

                            <TableCell className="text-table_text">
                                <Button
                                    onPress={() => router.push(`/application/${app.id}/notes`)}
                                    className="text-xs text-muted hover:text-primary"
                                    >
                                    Notes
                                </Button>
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