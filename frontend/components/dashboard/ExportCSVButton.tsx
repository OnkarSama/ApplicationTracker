"use client";

import { Application } from "@/api/application";

interface Props {
    applications: Application[];
}

const PRIORITY_LABELS: Record<number, string> = {
    0: "Normal",
    1: "Important",
    2: "Urgent",
};

const CSV_HEADERS = [
    "Company / Role",
    "Status",
    "Category",
    "Priority",
    "Salary",
    "Date Applied",
    "Last Updated",
    "Latest Note",
] as const;

function escapeField(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function toRow(app: Application): string[] {
    return [
        escapeField(app.title),
        escapeField(app.status),
        escapeField(app.category),
        escapeField(PRIORITY_LABELS[app.priority] ?? "Normal"),
        escapeField(app.salary != null ? `$${Number(app.salary).toLocaleString()}` : ""),
        escapeField(new Date(app.created_at).toLocaleDateString()),
        escapeField(new Date(app.updated_at).toLocaleDateString()),
        escapeField(app.notes?.at(-1)?.content ?? ""),
    ];
}

function buildCSV(applications: Application[]): string {
    const header = CSV_HEADERS.join(",");
    const rows   = applications.map((app) => toRow(app).join(","));
    return [header, ...rows].join("\n");
}

function triggerDownload(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function ExportCSVButton({ applications }: Props) {
    const isEmpty = applications.length === 0;

    const handleExport = () => {
        if (isEmpty) return;
        const date     = new Date().toISOString().split("T")[0];
        const filename = `applications-${date}.csv`;
        const csv      = buildCSV(applications);
        triggerDownload(csv, filename);
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={isEmpty}
            title={isEmpty ? "No applications to export" : `Export ${applications.length} application${applications.length === 1 ? "" : "s"} as CSV`}
            className="
                inline-flex items-center gap-1.5
                px-3 py-1.5
                rounded-lg
                border border-border/50
                bg-foreground/[0.03]
                text-muted text-xs font-medium
                transition-colors duration-150
                hover:text-foreground hover:border-border hover:bg-foreground/[0.07]
                disabled:opacity-40 disabled:cursor-not-allowed
                sm:px-3.5 sm:py-2
            "
        >
            <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
        </button>
    );
}
