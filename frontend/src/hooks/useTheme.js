import { useState, useEffect } from 'react';

// Theme colors matching CSS variables
const themes = {
    dark: {
        primary: 'rgba(10, 59, 147, 1)',
        primaryLight: 'rgba(10, 59, 147, 0.6)',
        primaryBg: 'rgba(10, 59, 147, 0.1)',
        primaryGlow: 'rgba(10, 59, 147, 0.4)',
        secondary: 'rgba(229, 61, 23, 1)',
        secondaryLight: 'rgba(229, 61, 23, 0.6)',
        secondaryBg: 'rgba(229, 61, 23, 0.1)',
        secondaryGlow: 'rgba(229, 61, 23, 0.4)',
        bgBase: '#020617',
        bgSurface: '#0f172a',
        bgElevated: '#1e293b',
        borderColor: '#1e293b',
        borderSubtle: '#334155',
        textPrimary: '#f8fafc',
        textSecondary: '#e2e8f0',
        textMuted: '#94a3b8',
    },
    light: {
        primary: 'rgba(10, 59, 147, 1)',
        primaryLight: 'rgba(10, 59, 147, 0.6)',
        primaryBg: 'rgba(10, 59, 147, 0.1)',
        primaryGlow: 'rgba(10, 59, 147, 0.4)',
        secondary: 'rgba(229, 61, 23, 1)',
        secondaryLight: 'rgba(229, 61, 23, 0.6)',
        secondaryBg: 'rgba(229, 61, 23, 0.1)',
        secondaryGlow: 'rgba(229, 61, 23, 0.4)',
        bgBase: '#e8e8e8',
        bgSurface: '#f5f5f5',
        bgElevated: '#ffffff',
        borderColor: '#d1d5db',
        borderSubtle: '#9ca3af',
        textPrimary: '#1f2937',
        textSecondary: '#374151',
        textMuted: '#6b7280',
    }
};

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const newTheme = localStorage.getItem('theme') || 'dark';
            setTheme(newTheme);
        };

        // Listen for theme changes from other components
        window.addEventListener('storage', handleStorageChange);
        
        // Also check periodically for changes made in same tab
        const interval = setInterval(() => {
            const currentTheme = localStorage.getItem('theme') || 'dark';
            if (currentTheme !== theme) {
                setTheme(currentTheme);
            }
        }, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [theme]);

    return {
        theme,
        colors: themes[theme] || themes.dark,
        isDark: theme === 'dark'
    };
}

export default useTheme;
