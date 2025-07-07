/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Mental Health Optimized Color Palette
      colors: {
        // Primary palette - calm and therapeutic
        mindflow: {
          blue: '#5C67F2',    // Calm blue - primary brand
          aqua: '#00A89D',    // Aqua green - secondary
          lavender: '#845EC2', // Lavender - accent
        },
        // Soft accent colors for mental health
        therapy: {
          peach: '#FF9A8B',   // Soft peach
          yellow: '#FFC75F',  // Warm yellow
          coral: '#FF6F61',   // Gentle coral
        },
        // Background variations for different moods
        wellness: {
          soft: '#f6f8fc',    // Soft white (main bg)
          warm: '#fffaf3',    // Warm ivory
          mint: '#f2f7f5',    // Minty white
        },
        // Extended semantic colors for mental health states
        mood: {
          happy: '#FFD93D',
          calm: '#6BCF7F', 
          neutral: '#A8A8A8',
          sad: '#6FA8DC',
          anxious: '#FFB347',
          angry: '#FF6B6B',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Mental Health Focused Typography
      fontFamily: {
        'Inter': ['Inter', 'sans-serif'],
        'Nunito': ['Nunito', 'sans-serif'],
        'sans': ['Inter', 'Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Therapeutic text sizing for readability
        'therapy-sm': ['14px', '1.6'],
        'therapy-base': ['16px', '1.7'],
        'therapy-lg': ['18px', '1.7'],
        'therapy-xl': ['20px', '1.6'],
        'therapy-2xl': ['24px', '1.5'],
        'therapy-3xl': ['28px', '1.4'],
        'therapy-4xl': ['32px', '1.3'],
      },
      // Gentle spacing for reduced anxiety
      spacing: {
        'therapy': '1.5rem',    // 24px - standard therapeutic spacing
        'calm': '2rem',         // 32px - calming spacing
        'serene': '3rem',       // 48px - serene, open spacing
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Soft, organic shapes for mental health
        'therapy': '12px',
        'calm': '16px',
        'serene': '24px',
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
        // Gentle, therapeutic animations
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gentle-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "breathe": "breathe 3s ease-in-out infinite",
        "fade-up": "fade-up 0.3s ease-out",
        "gentle-pulse": "gentle-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
