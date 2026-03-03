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
                sans: ["DM Sans", "var(--font-sans)", "sans-serif"],
                mono: ["var(--font-mono)"],
                display: ["Sora", "sans-serif"],
            },

            backgroundImage: {
                'button-gradient':
                    'linear-gradient(135deg, #6366f1, #8b5cf6)',
                'card-glow':
                    'radial-gradient(circle at top, rgba(99,102,241,.25), transparent)',
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

                        primary: "#6366f1",
                        primary_hover: "#4f46e5",

                        secondary: "#8b5cf6",
                        accent: "#f472b6",

                        border: "#1e293b",

                        heading: "#ffffff",
                        subheading: "#cbd5e1",
                        text: "#e2e8f0",
                        muted: "#64748b",

                        table_bg: "#0f172a",
                        table_border: "#1e293b",

                        success: "#10b981",
                        warning: "#f59e0b",
                        danger: "#ef4444",
                        info: "#38bdf8",
                    }
                },

                light: {
                    colors: {
                        background: "#f4f6f9",
                        foreground: "#0f172a",

                        card: "#ffffff",
                        card_hover: "#f1f5f9",

                        primary: "#6366f1",
                        primary_hover: "#4f46e5",

                        secondary: "#6366f1",
                        accent: "#8b5cf6",

                        border: "#e2e8f0",

                        heading: "#0f172a",
                        subheading: "#334155",
                        text: "#1e293b",
                        muted: "#94a3b8",

                        table_bg: "#ffffff",
                        table_border: "#e2e8f0",

                        success: "#10b981",
                        warning: "#f59e0b",
                        danger: "#ef4444",
                        info: "#0284c7",
                    }
                }
            }
        })
    ],
}

module.exports = config