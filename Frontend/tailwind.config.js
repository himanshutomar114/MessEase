/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        gradient: 'gradient 8s linear infinite'
      },
      screens: {
        'custom': {'min': '1000px'},
      },
    },
  },
  plugins: [],
}

// "headers": [
//       {
//         "source": "/(.*)",
//         "headers": [
//           {
//             "key": "Cross-Origin-Opener-Policy",
//             "value": "same-origin-allow-popups"
//           },
//           {
//             "key": "Cross-Origin-Embedder-Policy",
//             "value": "require-corp"
//           },
//           {
//             "key": "Cross-Origin-Resource-Policy",
//             "value": "cross-origin"
//           }
//         ]
//       }
//     ]