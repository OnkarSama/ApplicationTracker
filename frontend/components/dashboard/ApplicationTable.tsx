"use client";

import React from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Pagination,
    SortDescriptor,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRouter from "@/api/router";

interface Application {
    id: number;
    title: string;
    notes: string;
    status: string;
    priority: number;
    category: string;
    created_at: string;
}

interface Props {
    applications?: Application[];
}

const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Wishlist"] as const;

const statusColorMap: Record<string, any> = {
    Applied:   "primary",
    Interview: "warning",
    Offer:     "success",
    Rejected:  "danger",
    Wishlist:  "secondary",
};

const statusPillClass: Record<string, string> = {
    Applied:   "bg-blue-100 text-black dark:bg-yellow-400 dark:text-slate-400",
    Interview: "bg-amber-100 text-black dark:bg-yellow-400 dark:text-slate-400",
    Offer:     "bg-green-100 text-black dark:bg-yellow-400 dark:text-slate-400",
    Rejected:  "bg-red-100 text-black dark:bg-yellow-400 dark:text-slate-400",
    Wishlist:  "bg-purple-100 text-black dark:bg-yellow-400 dark:text-slate-400",
};

const priorityMap: Record<number, { label: string; color: any; pillClass: string }> = {
    0: { label: "Low",    color: "success", pillClass: "bg-green-100 text-black dark:bg-yellow-400 dark:text-slate-400" },
    1: { label: "Medium", color: "warning", pillClass: "bg-amber-100 text-black dark:bg-yellow-400 dark:text-slate-400" },
    2: { label: "High",   color: "danger",  pillClass: "bg-red-100   text-black dark:bg-yellow-400 dark:text-slate-400" },
};

export default function ApplicationTable({ applications = [] }: Props) {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const queryClient  = useQueryClient();

    const initialPage = Number(searchParams.get("page")) || 1;
    const rowsPerPage = 10;

    const [page, setPage] = React.useState(initialPage);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column:    "created_at",
        direction: "descending",
    });

    /* ---------- STATUS UPDATE MUTATION ---------- */
    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            apiRouter.applications.updateApplication(id, {
                application: { status },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getApplications"] });
        },
    });

    /* ---------- SORT ---------- */
    const sortedApps = React.useMemo(() => {
        const sorted = [...applications];
        const { column, direction } = sortDescriptor;

        sorted.sort((a, b) => {
            let first: any  = a[column as keyof Application];
            let second: any = b[column as keyof Application];

            if (typeof first === "number" && typeof second === "number") {
                return direction === "descending" ? second - first : first - second;
            }
            if (column === "created_at") {
                return direction === "descending"
                    ? new Date(second).getTime() - new Date(first).getTime()
                    : new Date(first).getTime() - new Date(second).getTime();
            }
            first  = String(first  ?? "").toLowerCase();
            second = String(second ?? "").toLowerCase();
            if (first < second) return direction === "descending" ?  1 : -1;
            if (first > second) return direction === "descending" ? -1 :  1;
            return 0;
        });

        return sorted;
    }, [applications, sortDescriptor]);

    /* ---------- PAGINATION ---------- */
    const displayedApps = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return sortedApps.slice(start, start + rowsPerPage);
    }, [sortedApps, page]);

    const pages = Math.max(1, Math.ceil(sortedApps.length / rowsPerPage));

    React.useEffect(() => {
        if (page > pages) setPage(pages);
    }, [pages]);

    React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [page]);

    console.log("Applications in table:", applications);

    /* ---------- TABLE ---------- */
    return (
        <>
            <div className="relative overflow-x-auto">
                <Table
                    removeWrapper
                    isHeaderSticky
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    className="bg-table_bg rounded-xl border border-table_border shadow-[0_18px_40px_rgba(0,0,0,0.35)] w-full"
                    classNames={{ th: "dark:bg-background dark:text-slate-400" }}
                >
                    <TableHeader>
                        <TableColumn key="title"      allowsSorting>Title</TableColumn>
                        <TableColumn key="status"     allowsSorting>Status</TableColumn>
                        <TableColumn key="priority"   allowsSorting>Priority</TableColumn>
                        <TableColumn key="category"   allowsSorting>Category</TableColumn>
                        <TableColumn key="notes"                   >Notes</TableColumn>
                        <TableColumn key="created_at" allowsSorting>Created</TableColumn>
                    </TableHeader>

                    <TableBody emptyContent="No applications found." items={displayedApps}>
                        {(app) => (
                            <TableRow key={app.id}>

                                <TableCell className="text-table_text">{app.title}</TableCell>

                                {/* ── Status — pill that opens a dropdown ── */}
                                <TableCell>
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <button className="outline-none cursor-pointer">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusPillClass[app.status] || statusPillClass["Applied"]}`}>
                                                    {app.status}
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-60">
                                                        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </span>
                                            </button>
                                        </DropdownTrigger>

                                        <DropdownMenu
                                            aria-label="Change status"
                                            selectedKeys={new Set([app.status])}
                                            selectionMode="single"
                                            onAction={(key) => {
                                                if (key !== app.status) {
                                                    statusMutation.mutate({ id: app.id, status: key as string });
                                                }
                                            }}
                                        >
                                            {STATUSES.map((s) => (
                                                <DropdownItem key={s} textValue={s}>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusPillClass[s]}`}>
                                                        {s}
                                                    </span>
                                                </DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                    </Dropdown>
                                </TableCell>

                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityMap[app.priority]?.pillClass || "bg-gray-100 text-black dark:bg-yellow-400 dark:text-slate-400"}`}>
                                        {priorityMap[app.priority]?.label || "Unknown"}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <Chip size="sm" variant="flat">{app.category}</Chip>
                                </TableCell>

                                <TableCell>
                                    <span className="text-table_text line-clamp-2">{app.notes}</span>
                                </TableCell>

                                <TableCell>
                                    <span className="text-table_text">
                                        {new Date(app.created_at).toLocaleDateString("en-US", {
                                            month: "2-digit",
                                            day:   "2-digit",
                                            year:  "numeric",
                                        })}
                                    </span>
                                </TableCell>

                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="mt-4">
                <Pagination
                    showControls
                    isCompact
                    showShadow
                    page={page}
                    total={pages}
                    variant="flat"
                    onChange={setPage}
                />
            </div>
        </>
    );
}