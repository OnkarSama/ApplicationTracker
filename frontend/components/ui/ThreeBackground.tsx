"use client";

import { useRef } from "react";
import { useThreeBackground } from "@/hooks/useThreeBackground";

export default function ThreeBackground({ children }: { children?: React.ReactNode }) {
    const mountRef = useRef<HTMLDivElement>(null);
    useThreeBackground(mountRef as React.RefObject<HTMLDivElement>);

    return (
        <div ref={mountRef} className="h-screen w-screen overflow-hidden bg-linear-gradient">
            {children}
            <div className="absolute inset-0 pointer-events-none z-5 bg-radial-gradient" />
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-6 bg-linear-gradient h-36" />
        </div>
    );
}