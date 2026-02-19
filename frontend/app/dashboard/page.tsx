"use client";

import ApplicationHeader from "@/components/dashboard/ApplicationHeader";
import ApplicationTable from "@/components/dashboard/ApplicationTable";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiRouter from "@/api/router";

export default function HomePage() {
    const router = useRouter();

    const { data = [], isLoading, error } = useQuery({
        queryKey: ["getApplications"],
        queryFn: apiRouter.applications.getApplications,
    });

    const handleNewApplication = () => {
        router.push("/application/create");
    };

    if (isLoading) return <p className="p-6">Loading applications...</p>;
    if (error) return <p className="p-6 text-red-500">Failed to load data</p>;

    return (
        <main className="max-w-7xl mx-auto p-6">
            <ApplicationHeader onNewApplication={handleNewApplication} />

            <ApplicationTable applications={data} />
        </main>
    );
}
