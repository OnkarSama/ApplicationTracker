export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "Application Tracker",
    description: "Track and manage application in one place!",
    navItems: [
        {
            label: "Home",
            href: "/dashboard",
        },
        {
            label: "New Ticket",
            href: "/application/create",
        },

    ],
    navMenuItems: [
        {
            label: "Home",
            href: "/dashboard",
        },
        {
            label: "New Ticket",
            href: "/application/create",
        },
        {
            label: "Logout",
            action: "logout",
        }
    ],
    links: {
    },
};