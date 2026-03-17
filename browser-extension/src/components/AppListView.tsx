import { useQuery } from "@tanstack/react-query";
import apiRouter from "@/api/router";
import type { Application } from "@/api/application";

export default function AppListView() {
    const { data, isLoading } = useQuery<Application[]>({
        queryKey: ['applications'],
        queryFn: () => apiRouter.applications.getApplications()
    });

    if (isLoading) return <div>Loading...</div>;

    console.log(data);

    return (
        <div>
            {data?.map((app) => (
                <div key={app.id}>
                    <p>{app.title}</p>
                    <p>{app.status}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}