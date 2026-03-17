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

export default function AppListView() {
    const { data, isLoading } = useQuery<Application[]>({
        queryKey: ['applications'],
        queryFn: () => apiRouter.applications.getApplications(),
        refetchInterval: 300000
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="w-full p-2">
            <Table
                isHeaderSticky
                aria-label="Applications"
            >
                <TableHeader>
                    <TableColumn>TITLE</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                </TableHeader>

                <TableBody emptyContent="No applications found." items={data}>
                    {(app) => (
                        <TableRow key={app.id}>
                            <TableCell>{app.title}</TableCell>
                            <TableCell>{app.category}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}