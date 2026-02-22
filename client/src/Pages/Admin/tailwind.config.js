/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: '#9b1c31',
                accent: '#ffcc00',
            },
        },
    },
    plugins: [],
}
