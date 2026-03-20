export const theme = {
    colors: {
        primary: '#000000',      // Solid Black for minimalist feel
        secondary: '#4F46E5',    // Indigo for subtle accents
        accent: '#10B981',       // Emerald for success/positive actions
        background: '#FFFFFF',   // Pure White
        surface: '#F9FAFB',      // Very light gray for cards/sections
        text: {
            primary: '#111827',  // Deep Black-Gray
            secondary: '#4B5563',// Medium Gray
            muted: '#9CA3AF',    // Light Gray
        },
        border: '#F3F4F6',       // Very subtle border
        borderMedium: '#E5E7EB', // Slightly more visible border
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 40,
    },
    borderRadius: {
        none: 0,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },
    typography: {
        h1: {
            fontSize: 28,
            fontWeight: '800' as const,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 22,
            fontWeight: '700' as const,
            letterSpacing: -0.3,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
        },
        caption: {
            fontSize: 13,
            fontWeight: '500' as const,
            color: '#6B7280',
        },
        button: {
            fontSize: 15,
            fontWeight: '600' as const,
        }
    }
};
