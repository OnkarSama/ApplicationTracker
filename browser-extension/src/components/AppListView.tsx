import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import type { Application } from "@/api/application";
import { Button, addToast } from "@heroui/react";

export default function AppListView({
    onAppClick,
    onLogout,
}: {
    onAppClick: (app: Application) => void;
    onLogout: () => void;
}) {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    const { data = [], isLoading } = useQuery<Application[]>({
        queryKey: ["applications"],
        queryFn: () => apiRouter.applications.getApplications(),
        refetchInterval: 300000,
    });

    const handleLogout = () => {
        addToast({
            title: "Signed out",
            description: "You've been logged out successfully.",
            timeout: 1500,
            shouldShowTimeoutProgress: true,
            variant: "solid",
            color: "success",
        });
        onLogout();
    };

    // Group applications by company
    const grouped = data.reduce<Record<string, Application[]>>((acc, app) => {
        (acc[app.company] ??= []).push(app);
        return acc;
    }, {});

    const companies = Object.keys(grouped).sort();

    // --- Nested position list for a single company ---
    if (selectedCompany) {
        const apps = grouped[selectedCompany] ?? [];
        return (
            <div className="flex flex-col h-full bg-heroui-background">
                {/* Header */}
                <div className="px-4 pt-5 pb-3 border-b border-heroui-border flex items-center gap-3">
                    <button
                        onClick={() => setSelectedCompany(null)}
                        className="text-heroui-muted hover:text-heroui-text transition-colors text-sm"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-heroui-heading">{selectedCompany}</h1>
                        <p className="text-xs text-heroui-muted mt-0.5">{apps.length} applications</p>
                    </div>
                </div>

                {/* Position list */}
                <div className="flex-1 px-3 py-3 flex flex-col gap-2 min-h-0">
                    {apps.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => onAppClick(app)}
                            className="flex-1 w-full text-left px-4 rounded-xl border border-heroui-border bg-heroui-card hover:bg-heroui-card_hover transition-colors flex items-center justify-between"
                        >
                            <div>
                                <p className="text-sm font-medium text-heroui-text">
                                    {app.position ?? "No position listed"}
                                </p>
                                <p className="text-xs text-heroui-muted mt-0.5">{app.category}</p>
                            </div>
                            <span className="text-heroui-muted text-xs">→</span>
                        </button>
                    ))}
                </div>

                {/* Bottom logout */}
                <div className="px-4 py-4 border-t border-heroui-border flex-shrink-0">
                    <Button fullWidth color="danger" variant="flat" onPress={handleLogout}>
                        Sign Out
                    </Button>
                </div>
            </div>
        );
    }

    // --- Top-level company list ---
    return (
        <div className="flex flex-col h-full bg-heroui-background">
            {/* Header */}
            <div className="px-4 pt-5 pb-3 border-b border-heroui-border">
                <h1 className="text-lg font-semibold text-heroui-heading">Applications</h1>
                <p className="text-xs text-heroui-muted mt-0.5">Select a company to view credentials</p>
            </div>

            {/* Company list */}
            <div className="flex-1 px-3 py-3 flex flex-col gap-2 min-h-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-heroui-muted text-sm">
                        Loading...
                    </div>
                ) : companies.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-heroui-muted text-sm">
                        No applications found.
                    </div>
                ) : (
                    companies.map((company) => {
                        const apps = grouped[company];
                        const single = apps.length === 1;
                        return (
                            <button
                                key={company}
                                onClick={() => single ? onAppClick(apps[0]) : setSelectedCompany(company)}
                                className="flex-1 w-full text-left px-4 rounded-xl border border-heroui-border bg-heroui-card hover:bg-heroui-card_hover transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-heroui-text">{company}</p>
                                    {single && apps[0].position && (
                                        <p className="text-xs text-heroui-muted mt-0.5">{apps[0].position}</p>
                                    )}
                                    {!single && (
                                        <p className="text-xs text-heroui-muted mt-0.5">{apps.length} positions</p>
                                    )}
                                </div>
                                <span className="text-heroui-muted text-xs">→</span>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Bottom logout */}
            <div className="px-4 py-4 border-t border-heroui-border">
                <Button fullWidth color="danger" variant="flat" onPress={handleLogout}>
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
