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
} from "@heroui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function ApplicationTable({ applications = [] }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialPage = Number(searchParams.get("page")) || 1;
    const rowsPerPage = 10;

    const [page, setPage] = React.useState(initialPage);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "created_at",
        direction: "descending",
    });

    /* ---------- COLOR MAPS ---------- */
    const statusColorMap: Record<string, any> = {
        Applied: "primary",
        Interview: "warning",
        Offer: "success",
        Rejection: "danger",
    };

    const priorityMap: Record<number, { label: string; color: any }> = {
        0: { label: "Low", color: "success" },
        1: { label: "Medium", color: "warning" },
        2: { label: "High", color: "danger" },
    };

    /* ---------- SORT ---------- */
    const sortedApps = React.useMemo(() => {
        const sorted = [...applications];
        const { column, direction } = sortDescriptor;

        sorted.sort((a, b) => {
            let first: any = a[column as keyof Application];
            let second: any = b[column as keyof Application];

            // numbers
            if (typeof first === "number" && typeof second === "number") {
                return direction === "descending"
                    ? second - first
                    : first - second;
            }

            // dates
            if (column === "created_at") {
                return direction === "descending"
                    ? new Date(second).getTime() - new Date(first).getTime()
                    : new Date(first).getTime() - new Date(second).getTime();
            }

            // strings
            first = String(first ?? "").toLowerCase();
            second = String(second ?? "").toLowerCase();

            if (first < second) return direction === "descending" ? 1 : -1;
            if (first > second) return direction === "descending" ? -1 : 1;
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

    /* ---------- DEBUG ---------- */
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
                >
                    <TableHeader>
                        <TableColumn key="id" allowsSorting>ID</TableColumn>
                        <TableColumn key="title" allowsSorting>Title</TableColumn>
                        <TableColumn key="status" allowsSorting>Status</TableColumn>
                        <TableColumn key="priority" allowsSorting>Priority</TableColumn>
                        <TableColumn key="category" allowsSorting>Category</TableColumn>
                        <TableColumn key="notes">Notes</TableColumn>
                        <TableColumn key="created_at" allowsSorting>
                            Created
                        </TableColumn>
                    </TableHeader>

                    <TableBody emptyContent="No applications found." items={displayedApps}>
                        {(app) => (
                            <TableRow key={app.id}>
                                <TableCell>
                                    <Link href={`/application/${app.id}`} className="hover:underline">
                                        #{app.id}
                                    </Link>
                                </TableCell>

                                <TableCell>{app.title}</TableCell>

                                <TableCell>
                                    <Chip size="sm" color={statusColorMap[app.status] || "primary"}>
                                        {app.status}
                                    </Chip>
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        size="sm"
                                        color={priorityMap[app.priority]?.color || "default"}
                                    >
                                        {priorityMap[app.priority]?.label || "Unknown"}
                                    </Chip>
                                </TableCell>

                                <TableCell>
                                    <Chip size="sm" variant="flat">
                                        {app.category}
                                    </Chip>
                                </TableCell>

                                <TableCell>
                                    <span className="line-clamp-2">{app.notes}</span>
                                </TableCell>

                                <TableCell>
                                    {new Date(app.created_at).toLocaleDateString()}
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
