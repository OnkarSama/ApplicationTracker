"use client";

import { useIdleTimer } from "react-idle-timer";
import { useRouter } from "next/navigation";
import endpoints from "@/api/router";

export default function IdleHandler() {
    const router = useRouter();

    const handleOnIdle = async () => {
        try {
            await endpoints.sessions.destroySession();
        } catch (e) {}

        router.push("/login?timeout=true");
    };

    useIdleTimer({
        timeout: 1000 * 60 * 60,
        onIdle: handleOnIdle,
        debounce: 500,
    });

    return null;
}