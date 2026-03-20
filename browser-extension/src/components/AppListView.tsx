import { useQuery } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import type { Application } from "@/api/application";
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, addToast
} from "@heroui/react";

export default function AppListView({
                                        onAppClick,
                                        onLogout
                                    }: {
    onAppClick: (app: Application) => void
    onLogout: () => void
}) {
    const { data, isLoading } = useQuery<Application[]>({
        queryKey: ['applications'],
        queryFn: () => apiRouter.applications.getApplications(),
        refetchInterval: 300000
    });

    const handleLogout = () => {
        addToast({
            title: "Signed out",
            description: "You've been logged out successfully.",
            timeout: 1500,
            shouldShowTimeoutProgress: true,
            variant: "solid",
            color: "success",
        })
        onLogout()
    }

    return (
        <div className="flex flex-col h-full bg-heroui-background">
            {/* Header */}
            <div className="px-4 pt-5 pb-3 border-b border-heroui-border">
                <h1 className="text-lg font-semibold text-heroui-heading">Applications</h1>
                <p className="text-xs text-heroui-muted mt-0.5">Select an app to view credentials</p>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-heroui-muted text-sm">
                        Loading...
                    </div>
                ) : (
                    <Table
                        isHeaderSticky
                        isStriped
                        aria-label="Applications"
                        classNames={{
                            base: "bg-heroui-card rounded-xl",
                            th: "bg-heroui-card text-heroui-muted text-xs uppercase tracking-wider border-b border-heroui-border",
                            td: "text-heroui-text cursor-pointer",
                            tr: "hover:bg-heroui-card_hover transition-colors"
                        }}
                    >
                        <TableHeader>
                            <TableColumn align="start">TITLE</TableColumn>
                            <TableColumn align="start">CATEGORY</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={
                            <span className="text-heroui-muted text-sm">No applications found.</span>
                        } items={data}>
                            {(app) => (
                                <TableRow key={app.id} onClick={() => onAppClick(app)}>
                                    <TableCell>{app.title}</TableCell>
                                    <TableCell>
                                        <span className="text-xs text-heroui-muted">{app.category}</span>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Bottom logout */}
            <div className="px-4 py-4 border-t border-heroui-border">
                <Button
                    fullWidth
                    color="danger"
                    variant="flat"
                    onPress={handleLogout}
                >
                    Sign Out
                </Button>
            </div>
        </div>
    )
}