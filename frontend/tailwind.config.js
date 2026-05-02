/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro manual con clase 'dark'
  theme: {
    extend: {
      colors: {
        // Variables CSS personalizadas para temas médicos
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        'secondary-hover': 'var(--color-secondary-hover)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',

        // Fondos
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-accent': 'var(--bg-accent)',

        // Textos
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',

        // Estados
        'success-bg': 'var(--success-bg)',
        'success-text': 'var(--success-text)',
        'error-bg': 'var(--error-bg)',
        'error-text': 'var(--error-text)',
        'warning-bg': 'var(--warning-bg)',
        'warning-text': 'var(--warning-text)',

        // Bordes
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-dark': 'var(--border-dark)',
      },
    },
  },
  plugins: [],
}