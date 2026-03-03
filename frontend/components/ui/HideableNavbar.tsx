"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";

export default function HideableNavbar() {
    const pathname = usePathname();


    const hideNavbarRoutes = ["/"]; // login page

    if (hideNavbarRoutes.includes(pathname)) {
        return null;
    }

    return <Navbar />;
}