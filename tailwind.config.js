/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure this covers all component files
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': { // Custom name for the primary green
          DEFAULT: '#22c55e', // Example: Tailwind's green-500, adjust if needed
          dark: '#16a34a',   // Darker shade for hover/active
          light: '#dcfce7',  // Lighter shade for backgrounds
        },
        'brand-gray': { // Custom grays
          light: '#f3f4f6', // bg-gray-100
          DEFAULT: '#6b7280', // text-gray-500
          dark: '#374151',   // text-gray-700
          darker: '#1f2937', // bg-gray-800
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'], // Add Inter as primary sans-serif font
      },
      backgroundImage: { // For the gradient
        'course-gradient': 'linear-gradient(to bottom, #e0f2fe, #f0fdf4)', // Example light blue to light green
      }
    },
  },
  plugins: [],
}
