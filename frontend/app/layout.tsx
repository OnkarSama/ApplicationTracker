import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { siteConfig } from "@/config/site";

import HideableNavbar from "@/components/ui/HideableNavbar";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: "/favicon.ico",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html className="m-0 p-0" suppressHydrationWarning lang="en">
        <body className="min-h-screen text-foreground bg-background font-sans antialiased">
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <div className="relative flex flex-col min-h-screen">
                <HideableNavbar />

                <main className="pt-6 px-8 pb-10 flex-1">{children}</main>

                {/* THEME SWITCHER FLOATING BUTTON */}
                <div
                    className="
                fixed
                bottom-4 right-4
                sm:bottom-6 sm:right-6
                md:bottom-8 md:right-8
                z-50
              "
                >
                    <ThemeSwitcher className="transition-transform duration-300 hover:scale-110 hover:rotate-12 shadow-lg rounded-full" />
                </div>
            </div>
        </Providers>
        </body>
        </html>
    );
}
