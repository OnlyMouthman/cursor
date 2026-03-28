/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: 'var(--color-bg-page)',
        surface: 'var(--color-bg-surface)',
        soft: 'var(--color-bg-soft)',
        ink: {
          main: 'var(--color-text-main)',
          strong: 'var(--color-text-strong)',
          muted: 'var(--color-text-muted)',
        },
        line: 'var(--color-border)',
        divider: 'var(--color-divider)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          foreground: 'var(--color-on-primary)',
          subtle: 'var(--color-primary-muted)',
        },
        header: {
          DEFAULT: 'var(--color-header-bg)',
          fg: 'var(--color-header-text)',
          'fg-muted': 'var(--color-header-text-muted)',
          'control-hover': 'var(--color-header-control-hover)',
        },
        card: {
          DEFAULT: 'var(--color-card-bg)',
          border: 'var(--color-card-border)',
        },
        sidebar: {
          DEFAULT: 'var(--color-sidebar-bg)',
          fg: 'var(--color-sidebar-text)',
          active: 'var(--color-sidebar-active-bg)',
          'active-fg': 'var(--color-sidebar-active-fg)',
          'row-hover': 'var(--color-sidebar-row-hover)',
        },
      },
      ringColor: {
        focus: 'var(--color-focus-ring)',
      },
    },
  },
  plugins: [],
}
