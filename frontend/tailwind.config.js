import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/toast/dist/**/*.{js,ts,jsx,tsx}"
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["DM Sans", "sans-serif"],
                mono: ["var(--font-mono)"],


                sora: ["Sora", "sans-serif"],
            },

            backgroundImage: {
                // bg-button-gradient → "Add Application" button
                'button-gradient': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                'card-glow': 'radial-gradient(circle at top, rgba(99,102,241,.25), transparent)',
                'hero-gradient': 'linear-gradient(90deg, hsl(var(--heroui-info)) 0%, hsl(var(--heroui-primary)) 40%, hsl(var(--heroui-secondary)) 70%, hsl(var(--heroui-success)) 100%)',
                'radial-gradient': 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 28%, hsl(var(--heroui-background) / 0.72) 100%)',
                'linear-gradient' : 'linear-gradient(to top, hsl(var(--heroui-background) / 0.88) 0%, transparent 100%)'
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
                        background: "#0B0F1F",
                        foreground: "#F5F5F7",
                        card: "#121831",
                        card_hover: "#1A2133",
                        primary: "#6366F1",
                        primary_hover: "#4F46E5",
                        secondary: "#9F7AEA",
                        accent: "#F472B6",
                        border: "#2E344E",
                        heading: "#FFFFFF",
                        subheading: "#CBD5E1",
                        text: "#E0E7FF",
                        muted: "#94A3B8",

                        // ── Table ──
                        table_bg: "#1F2937",       // dark gray for table rows
                        table_text: "#F5F5F7",     // off-white text
                        table_subheading: "#94A3B8",
                        table_border: "#374151",
                        table_hover: "#2C3345",    // darker hover for row clarity

                        // ── Status / Pills ──
                        success: "#10B981",
                        warning: "#FBBF24",
                        danger: "#EF4444",
                        info: "#3B82F6",
                        pill_active: "#4F46E5",
                    }
                },

                light: {
                    colors: {
                        background: "#F3F4F6",
                        foreground: "#0F172A",
                        card: "#F9FAFB",
                        card_hover: "#E5E7EB",
                        primary: "#6366F1",
                        primary_hover: "#4F46E5",
                        secondary: "#8B5CF6",
                        accent: "#D946EF",
                        border: "#D1D5DB",
                        heading: "#0F172A",
                        subheading: "#475569",
                        text: "#1E293B",
                        muted: "#64748B",

                        // ── Table ──
                        table_bg: "#E0E0E0",       // medium-light gray for table rows
                        table_text: "#0F172A",     // strong dark text
                        table_subheading: "#475569",
                        table_border: "#CBD5E1",
                        table_hover: "#D1D5DB",    // subtle hover effect

                        // ── Status / Pills ──
                        success: "#10B981",
                        warning: "#FBBF24",
                        danger: "#EF4444",
                        info: "#3B82F6",
                        pill_active: "#D8B4FE",
                    }
                }
            }
        })
    ],
}

module.exports = config