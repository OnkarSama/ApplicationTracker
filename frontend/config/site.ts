export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "ApplyOS",
    description: "Track and manage application in one place!",
    navItems: [],
    navMenuItems: [
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