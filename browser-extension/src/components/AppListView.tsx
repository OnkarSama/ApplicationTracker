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
    Chip,
} from "@heroui/react";

export default function AppListView() {
    const { data, isLoading } = useQuery<Application[]>({
        queryKey: ['applications'],
        queryFn: () => apiRouter.applications.getApplications(),
        refetchInterval: 300000
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <>
            <div className="relative overflow-x-auto">
                <Table
                    isHeaderSticky
                    className="bg-table_bg rounded-xl border border-table_border shadow-[0_18px_40px_rgba(0,0,0,0.35)] w-full"
                >
                    <TableHeader>
                        <TableColumn key="title">Title</TableColumn>
                        <TableColumn key="category">Category</TableColumn>
                    </TableHeader>

                    <TableBody emptyContent="No applications found." items={data}>
                        {(app) => (
                            <TableRow key={app.id}>
                                <TableCell className="text-table_text">{app.title}</TableCell>
                                <TableCell>
                                    <Chip size="sm" variant="flat">{app.category}</Chip>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}