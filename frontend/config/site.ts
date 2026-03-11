export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "ApplyOS",
    description: "Track and manage application in one place!",
    navItems: [
        {
            label: "Home",
            href: "/dashboard",
        },
        {
            label: "New Application",
            href: "/application/create",
        },

    ],
    navMenuItems: [
        {
            label: "Home",
            href: "/dashboard",
        },
        {
            label: "New Application",
            href: "/application/create",
        },
        {
            label: "Preferences",
            href: "/preferences",
        },
        {
            label: "Autofill Information",
            href: "/autofill",
        },
        {
            label: "Logout",
            action: "logout",
        }
    ],
    links: {
    },
};