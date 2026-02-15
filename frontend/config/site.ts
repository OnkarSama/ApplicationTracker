export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "Application Tracker",
    navItems: [
        {
            label: "Home",
            href: "/dashboard",
        },
        {
            label: "New Ticket",
            href: "/ticket/create",
        },

    ],
    navMenuItems: [
        {
            label: "Home",
            href: "/dashboard",
        },
        {
            label: "New Ticket",
            href: "/ticket/create",
        },
        {
            label: "Logout",
            action: "logout",
        }
    ],
    links: {
    },
};