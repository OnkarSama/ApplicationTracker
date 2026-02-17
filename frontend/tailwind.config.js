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
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
            },

            backgroundImage: {
                'button-gradient':
                    'linear-gradient(135deg, #9333ea, #6366f1)',
                'card-glow':
                    'radial-gradient(circle at top, rgba(147,51,234,.25), transparent)',
            },
        },
    },

    darkMode: "class",

    plugins: [
        heroui({
            prefix: "heroui",
            addCommonColors: true,
            defaultTheme: "light",

            themes: {
                dark: {
                    colors: {
                        background: "#020617",
                        foreground: "#f8fafc",

                        card: "#0f172a",
                        card_hover: "#111827",

                        primary: "#22d3ee",
                        primary_hover: "#06b6d4",

                        secondary: "#8b5cf6",
                        accent: "#f472b6",

                        border: "#1e293b",

                        heading: "#ffffff",
                        subheading: "#cbd5f5",
                        text: "#e2e8f0",
                        muted: "#64748b",

                        table_bg: "#0f172a",
                        table_border: "#1e293b",

                        success: "#22c55e",
                        warning: "#f59e0b",
                        danger: "#ef4444",
                        info: "#38bdf8",
                    }
                },

                light: {
                    colors: {
                        background: "#f8fafc",
                        foreground: "#020617",

                        card: "#ffffff",
                        card_hover: "#f1f5f9",

                        primary: "#0891b2",
                        primary_hover: "#0e7490",

                        secondary: "#7c3aed",
                        accent: "#ec4899",

                        border: "#e2e8f0",

                        heading: "#020617",
                        subheading: "#334155",
                        text: "#1e293b",
                        muted: "#94a3b8",

                        table_bg: "#ffffff",
                        table_border: "#e2e8f0",

                        success: "#15803d",
                        warning: "#b45309",
                        danger: "#b91c1c",
                        info: "#0284c7",
                    }
                }
            }
        })
    ],
}

module.exports = config
