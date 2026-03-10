"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiRouter from "@/api/router";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const [verified, setVerified] = useState(false);
    const router = useRouter();

    useEffect(() => {
        apiRouter.sessions.showUser()
            .then(() => setVerified(true))
            .catch(() => {
                router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            });
    }, []);

    if (!verified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}