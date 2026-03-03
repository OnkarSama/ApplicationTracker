import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],

    theme: {
        extend: {
            fontFamily: {
                // font-sans  → DM Sans (body text throughout the page)
                sans: ["DM Sans", "var(--font-sans)", "sans-serif"],
                mono: ["var(--font-mono)"],
                // font-display → Sora (h1, stat values)
                display: ["Sora", "sans-serif"],
            },

            backgroundImage: {
                // bg-button-gradient → "Add Application" button
                'button-gradient': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                'card-glow': 'radial-gradient(circle at top, rgba(99,102,241,.25), transparent)',
            },
        },
    },

    darkMode: "class",

    plugins: [
        heroui({
            prefix: "heroui",
            addCommonColors: true,
            defaultTheme: "dark",

            themes: {
                dark: {
                    colors: {
                        // Layout
                        background: "#020617",
                        foreground: "#f8fafc",

                        // Surfaces
                        card: "#0f172a",         // bg-heroui-card
                        card_hover: "#111827",

                        // Brand — #6366f1 indigo used on Applied stat, pills, filtered badge
                        primary: "#6366f1",
                        primary_hover: "#4f46e5",

                        // Purple accent — #8b5cf6 used in button gradient end-stop
                        secondary: "#8b5cf6",
                        accent: "#f472b6",

                        // Borders — #1e293b (dark) / #e2e8f0 (light)
                        border: "#1e293b",

                        // Typography
                        heading: "#ffffff",       // text-heroui-heading  → h1, Total stat
                        subheading: "#cbd5e1",
                        text: "#e2e8f0",          // text-heroui-text     → Input text
                        muted: "#64748b",          // text-heroui-muted    → labels, placeholders

                        // Table
                        table_bg: "#0f172a",
                        table_border: "#1e293b",  // border-heroui-table_border → CardHeader divider

                        // Status colours
                        success: "#10b981",        // text-heroui-success  → Offers stat
                        warning: "#f59e0b",         // text-heroui-warning  → Interviews stat
                        danger: "#ef4444",
                        info: "#38bdf8",

                        // Active pill background (#ede9fe is light-only; dark gets a tinted variant)
                        pill_active: "#3730a3",
                    }
                },

                light: {
                    colors: {
                        // Layout
                        background: "#f4f6f9",    // bg-heroui-background → page bg
                        foreground: "#0f172a",

                        // Surfaces
                        card: "#ffffff",           // bg-heroui-card       → stat cards, search input, pills
                        card_hover: "#f1f5f9",

                        // Brand — #6366f1 indigo
                        primary: "#6366f1",        // text-heroui-primary  → Applied stat, active pills, filtered badge
                        primary_hover: "#4f46e5",

                        // Purple — #8b5cf6 (button gradient end, accent)
                        secondary: "#8b5cf6",
                        accent: "#8b5cf6",

                        // Borders — #e2e8f0
                        border: "#e2e8f0",         // border-heroui-border → cards, divider, pills, input

                        // Typography
                        heading: "#0f172a",        // text-heroui-heading  → h1, Total stat
                        subheading: "#334155",
                        text: "#1e293b",            // text-heroui-text     → Input text
                        muted: "#94a3b8",           // text-heroui-muted    → labels, sub-text, placeholders

                        // Table
                        table_bg: "#ffffff",
                        table_border: "#e2e8f0",   // border-heroui-table_border → CardHeader bottom border

                        // Status colours
                        success: "#10b981",         // text-heroui-success  → Offers stat
                        warning: "#f59e0b",          // text-heroui-warning  → Interviews stat
                        danger: "#ef4444",
                        info: "#0284c7",

                        // Active pill background — bg-[#ede9fe] in page (violet-100)
                        pill_active: "#ede9fe",
                    }
                }
            }
        })
    ],
}

module.exports = config