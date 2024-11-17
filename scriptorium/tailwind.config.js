// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3b82f6', // Custom color for buttons or headings
        'light-gray': '#f8f9fa',  // Light background color for containers
        'editor-bg': '#f3f4f6',   // Light background for code editor
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'], // For code-like styling in editor and output
      },
      boxShadow: {
        'custom-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}