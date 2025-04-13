/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./resources/**/*.blade.php", "./resources/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        container: {
            center: true,
        },
        extend: {
            // colors: {
            //     primary: {
            //         DEFAULT: "#4361ee",
            //         light: "#eaf1ff",
            //         "dark-light": "rgba(67,97,238,.15)",
            //     },
            //     secondary: {
            //         DEFAULT: "#805dca",
            //         light: "#ebe4f7",
            //         "dark-light": "rgb(128 93 202 / 15%)",
            //     },
            //     success: {
            //         DEFAULT: "#00ab55",
            //         light: "#ddf5f0",
            //         "dark-light": "rgba(0,171,85,.15)",
            //     },
            //     danger: {
            //         DEFAULT: "#e7515a",
            //         light: "#fff5f5",
            //         "dark-light": "rgba(231,81,90,.15)",
            //     },
            //     warning: {
            //         DEFAULT: "#e2a03f",
            //         light: "#fff9ed",
            //         "dark-light": "rgba(226,160,63,.15)",
            //     },
            //     info: {
            //         DEFAULT: "#2196f3",
            //         light: "#e7f7ff",
            //         "dark-light": "rgba(33,150,243,.15)",
            //     },
            //     dark: {
            //         DEFAULT: "#3b3f5c",
            //         light: "#eaeaec",
            //         "dark-light": "rgba(59,63,92,.15)",
            //     },
            //     black: {
            //         DEFAULT: "#0e1726",
            //         light: "#e3e4eb",
            //         "dark-light": "rgba(14,23,38,.15)",
            //     },
            //     white: {
            //         DEFAULT: "#ffffff",
            //         light: "#e0e6ed",
            //         dark: "#888ea8",
            //     },
            // },
            colors: {
                primary: {
                    DEFAULT: '#2a9d8f', // Hijau daun
                    light: '#e0f4f1', // Hijau muda
                    'dark-light': 'rgba(42,157,143,.15)', // Hijau transparan
                },
                secondary: {
                    DEFAULT: '#264653', // Hijau gelap
                    light: '#d9e3e6', // Abu kehijauan
                    'dark-light': 'rgba(38,70,83,.15)', // Transparan gelap
                },
                success: {
                    DEFAULT: '#81b29a', // Hijau sukses lembut
                    light: '#f0f8f5', // Hijau pastel
                    'dark-light': 'rgba(129,178,154,.15)', // Transparan hijau sukses
                },
                danger: {
                    DEFAULT: '#e63946', // Merah bunga
                    light: '#ffe7e9', // Merah muda
                    'dark-light': 'rgba(230,57,70,.15)', // Transparan merah
                },
                warning: {
                    DEFAULT: '#f4a261', // Oranye daun kering
                    light: '#fdf4ec', // Oranye muda
                    'dark-light': 'rgba(244,162,97,.15)', // Transparan oranye
                },
                info: {
                    DEFAULT: '#457b9d', // Biru langit
                    light: '#e3effa', // Biru muda
                    'dark-light': 'rgba(69,123,157,.15)', // Transparan biru
                },
                dark: {
                    DEFAULT: '#1d3557', // Biru gelap malam
                    light: '#d2dae2', // Abu terang
                    'dark-light': 'rgba(29,53,87,.15)', // Transparan biru gelap
                },
                // black: {
                //     DEFAULT: '#2b2d42', // Hitam alami
                //     light: '#ececec', // Abu cerah
                //     'dark-light': 'rgba(43,45,66,.15)', // Transparan hitam
                // },
                // white: {
                //     DEFAULT: '#f8f9fa', // Putih awan
                //     light: '#e9f5f0', // Putih kehijauan
                //     dark: '#ced4da', // Abu muda
                // },
                black: {
                    DEFAULT: '#0e1726',
                    light: '#e3e4eb',
                    'dark-light': 'rgba(14,23,38,.15)',
                },
                white: {
                    DEFAULT: '#ffffff',
                    light: '#e0e6ed',
                    dark: '#888ea8',
                },
            },
            fontFamily: {
                nunito: ["Nunito", "sans-serif"],
            },
            spacing: {
                4.5: "18px",
            },
            boxShadow: {
                "3xl": "0 2px 2px rgb(224 230 237 / 46%), 1px 6px 7px rgb(224 230 237 / 46%)",
            },
            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        "--tw-prose-invert-headings":
                            theme("colors.white.dark"),
                        "--tw-prose-invert-links": theme("colors.white.dark"),
                        h1: {
                            fontSize: "40px",
                            marginBottom: "0.5rem",
                            marginTop: 0,
                        },
                        h2: {
                            fontSize: "32px",
                            marginBottom: "0.5rem",
                            marginTop: 0,
                        },
                        h3: {
                            fontSize: "28px",
                            marginBottom: "0.5rem",
                            marginTop: 0,
                        },
                        h4: {
                            fontSize: "24px",
                            marginBottom: "0.5rem",
                            marginTop: 0,
                        },
                        h5: {
                            fontSize: "20px",
                            marginBottom: "0.5rem",
                            marginTop: 0,
                        },
                        h6: {
                            fontSize: "16px",
                            marginBottom: "0.5rem",
                            marginTop: 0,
                        },
                        p: { marginBottom: "0.5rem" },
                        li: { margin: 0 },
                        img: { margin: 0 },
                    },
                },
            }),
        },
    },
    plugins: [
        require("@tailwindcss/forms")({
            strategy: "class",
        }),
        require("@tailwindcss/typography"),
    ],
};
