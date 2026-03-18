
import { useQuery } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import type { Application } from "@/api/application";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/react";

export default function AppListView({ onAppClick }: { onAppClick: (app: Application) => void }) {


    const { data, isLoading } = useQuery<Application[]>({
        queryKey: ['applications'],
        queryFn: () => apiRouter.applications.getApplications(),
        refetchInterval: 300000
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="relative overflow-x-auto">
            <Table
                isHeaderSticky
                isStriped
                aria-label="Applications"
            >
                <TableHeader>
                    <TableColumn align="start">TITLE</TableColumn>
                    <TableColumn align="start">CATEGORY</TableColumn>
                </TableHeader>

                <TableBody emptyContent="No applications found." items={data}>
                    {(app) => (
                        <TableRow  key={app.id} onClick={() => onAppClick(app)}>
                            <TableCell>{app.title}</TableCell>
                            <TableCell>{app.category}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}