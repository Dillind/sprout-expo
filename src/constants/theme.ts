import { TextStyle } from 'react-native';

export const COLORS = {
    black: '#000000',
    white: '#ffffff',

    // Primary Green Palette
    primary: '#2D6B49',
    primaryDark: '#5A8A3D',
    primaryLight: '#9CD374',

    // Background Colors
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#F8FAF6',
    backgroundTertiary: '#F0F4ED',

    // Text Colors
    textPrimary: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textTertiary: '#A0A0A0',

    // Status Colors
    success: '#78B652',
    error: '#E85D4A',
    info: '#4A9EE8',

    // Borders & Dividers
    border: '#E8EDE5',
    divider: '#E8EDE5',
};

export const THEME_COLORS = {
    light: {
        // Backgrounds
        background: COLORS.backgroundPrimary,
        backgroundSecondary: COLORS.backgroundSecondary,
        backgroundTertiary: COLORS.backgroundTertiary,

        // Text
        text: COLORS.textPrimary,
        textSecondary: COLORS.textSecondary,
        textTertiary: COLORS.textTertiary,

        // Primary
        primary: COLORS.primary,
        primaryDark: COLORS.primaryDark,
        primaryLight: COLORS.primaryLight,

        // Status
        success: COLORS.success,
        error: COLORS.error,
        info: COLORS.info,

        // UI Elements
        border: COLORS.border,
        divider: COLORS.divider,

        // Tab Bar
        tabBarBackground: COLORS.white,
        tabBarInactive: COLORS.textSecondary,
        tabBarActive: COLORS.primary,
    },
    dark: {
        // Backgrounds
        background: '#121212',
        backgroundSecondary: '#1E1E1E',
        backgroundTertiary: '#2A2A2A',

        // Text
        text: COLORS.white,
        textSecondary: '#B3B3B3',
        textTertiary: '#6B6B6B',

        // Primary (green stays same, but swap dark/light for contrast)
        primary: COLORS.primary,
        primaryDark: COLORS.primaryLight,
        primaryLight: COLORS.primaryDark,

        // Status
        success: COLORS.primary,
        error: '#FF6B6B',
        info: '#5EADFF',

        // UI Elements
        border: '#2A2A2A',
        divider: '#2A2A2A',

        // Tab Bar
        tabBarBackground: '#1E1E1E',
        tabBarInactive: '#B3B3B3',
        tabBarActive: COLORS.primary,
    },
};

export const FONTS = {
    InterRegular: 'Inter-Regular',
    InterBold: 'Inter-Bold',
    InterMedium: 'Inter-Medium',
    InterLight: 'Inter-Light',
    InterSemiBold: 'Inter-SemiBold',
};

export const TYPOGRAPHY_STYLES = {
    title: {
        bold: {
            fontSize: 32,
            lineHeight: Math.round(32 * 1.25),
            fontFamily: FONTS.InterBold,
        },
    },
    body: {
        small: {
            fontSize: 12,
            lineHeight: Math.round(12 * 1.25),
            fontFamily: FONTS.InterRegular,
        },
        medium: {
            fontSize: 14,
            lineHeight: Math.round(14 * 1.25),
            fontFamily: FONTS.InterMedium,
        },
        regular: {
            fontSize: 14,
            lineHeight: Math.round(14 * 1.25),
            fontFamily: FONTS.InterRegular,
        },
        bold: {
            fontSize: 14,
            lineHeight: Math.round(14 * 1.25),
            fontFamily: FONTS.InterBold,
        },
        large: {
            fontSize: 16,
            lineHeight: Math.round(16 * 1.25),
            fontFamily: FONTS.InterBold,
        },
        link: {
            color: COLORS.primary,
            fontFamily: FONTS.InterBold,
            fontSize: 14,
            lineHeight: Math.round(14 * 1.25),
            textDecorationLine: 'underline',
        },
    },
} satisfies Record<string, Record<string, TextStyle>>;
