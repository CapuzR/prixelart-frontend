import type { Config } from 'tailwindcss';
const path = require('path');
/**
 * Función auxiliar para generar la paleta de colores completa (ej. primary-50, primary-100...)
 * Lee las variables --color-primary-50, etc., definidas en tu archivo index.css.
 */
function generateColorPalette(name: string): { [key: string]: string } {
  const palette: { [key: string]: string } = {};
  // Pasos de color definidos en tus tokens
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
  for (const step of steps) {
    palette[step.toString()] = `rgb(var(--color-${name}-${step}) / <alpha-value>)`;
  }
  return palette;
}

/**
 * Función auxiliar para mapear un objeto de tokens a CSS Variables.
 * Ej: { XXS: '--spacing-xxs', XS: '--spacing-xs' } -> { xxs: 'var(--spacing-xxs)', xs: 'var(--spacing-xs)' }
 */
function mapTokensToCSSVars(tokens: { [key: string]: string }, prefix: string): { [key: string]: string } {
  const mapped: { [key: string]: string } = {};
  for (const key in tokens) {
    mapped[key.toLowerCase()] = `var(--${prefix}-${key.toLowerCase()})`;
  }
  return mapped;
}

const spacingTokens = {
  Zero: '--spacing-zero',
  XXS: '--spacing-xxs',
  XS: '--spacing-xs',
  X: '--spacing-x',
  S: '--spacing-s',
  M: '--spacing-m',
  L: '--spacing-l',
  XL: '--spacing-xl',
  XXL: '--spacing-xxl',
  XXXL: '--spacing-xxxl',
  XXXXL: '--spacing-xxxxl',
};

const radiiTokens = {
  M: '--radius-m',
  L: '--radius-l',
  XL: '--radius-xl',
};

const strokeTokens = {
  s: '--stroke-s',
  m: '--stroke-m',
  l: '--stroke-l',
  xl: '--stroke-xl',
  xxl: '--stroke-xxl',
  xxxl: '--stroke-xxxl',
  xxxxl: '--stroke-xxxxl',
};


const config: Config = {
  darkMode: "class",
  prefix: 'tw-',
    content: [
    "./index.html",
    "./src/App.tsx",
    "./src/main.tsx",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        
        primary: {
          default: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
          ...generateColorPalette('primary'),
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
          ...generateColorPalette('secondary'),
        },
        destructive: {
          DEFAULT: 'rgb(var(--color-primary-600) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        
        error: 'rgb(var(--color-error) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        
        brand: {
          main: 'rgb(var(--color-brand-main) / <alpha-value>)',
          light: 'rgb(var(--color-brand-light) / <alpha-value>)',
          lighter: 'rgb(var(--color-brand-lighter) / <alpha-value>)',
          dark: 'rgb(var(--color-brand-dark) / <alpha-value>)',
          darker: 'rgb(var(--color-brand-darker) / <alpha-value>)',
        }
      },
      
      borderRadius: {
        ...mapTokensToCSSVars(radiiTokens, 'radius'),
        lg: 'var(--radius-xl)',
        md: 'var(--radius-l)',
        sm: 'var(--radius-m)',
      },
      
      spacing: {
        ...mapTokensToCSSVars(spacingTokens, 'spacing'),
      },
      
      borderWidth: {
        ...mapTokensToCSSVars(strokeTokens, 'stroke'),
      },

      fontFamily: {
        sans: "var(--font-sans, 'Roboto', 'Helvetica', 'Arial', sans-serif)",
        mono: "var(--font-mono, 'Roboto Mono', 'Courier New', monospace)",
      },
      
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;