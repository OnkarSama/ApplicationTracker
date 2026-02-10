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
                'button-bg': 'linear-gradient(135deg, #3b82f6, #06b6d4)', // your gradient
            },
        },
    },
    darkMode: "class",
    plugins: [
        heroui({
            prefix: "heroui",
            addCommonColors: true,
            defaultTheme: "dark",
            defaultExtendTheme: "dark",
            layout: {},
            themes: {
                dark: {
                    layout: {},
                    colors: {
                        background: "#0f172a",
                        table_bg: "#020617",
                        table_border: "#164e63",
                        text: "#e0f2f1",
                        secondary: "#0f766e",
                        hover: "#115e59",
                        heading: "#5eead4",
                        subheading: "#22d3ee",
                        loading: "#99f6e4",
                        border: "#164e63",
                    }


                },
            }
        })
    ],
}

module.exports = config