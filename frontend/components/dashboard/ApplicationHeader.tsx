"use client";

import { Button } from "@heroui/react";

interface Props {
    onNewApplication: () => void;
}


export default function ApplicationHeader({ onNewApplication }: Props) {
    return (
        <div className="
            flex flex-col gap-4
            sm:flex-row sm:items-center sm:justify-between
            mb-6
        ">
            <div>
                <h1 className="text-heading text-2xl sm:text-3xl font-semibold">
                    Applications
                </h1>
                <p className="text-subheading text-sm sm:text-base">
                    View, filter, and manage applications.
                </p>
            </div>

            <Button
                className="
                    bg-button-bg text-text
                    w-full sm:w-auto
                "
                onPress={onNewApplication}
            >
                + New Application
            </Button>
        </div>
    );
}