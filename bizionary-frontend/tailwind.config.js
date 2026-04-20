/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1392ec",
                secondary: "#f1f5f9",
                background: "#f6f7f8", // Use background-light from html
                'background-dark': '#101a22',
                'ai-purple': '#8b5cf6',
                surface: "#FFFFFF",
                textMain: "#111518",
                textMuted: "#617989",
                success: "#10b981",
                danger: "#ef4444",
                warning: "#f59e0b"
            }
        },
    },
    plugins: [],
}
