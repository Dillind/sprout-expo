import { Platform } from 'react-native';

/**
 * Small - small and subtle elevation
 */
export const shadowSmall = Platform.select({
	ios: {
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	android: {
		elevation: 2,
	},
});

/**
 * Medium - cards and buttons
 */
export const shadowMedium = Platform.select({
	ios: {
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
	},
	android: {
		elevation: 4,
	},
});

/**
 * Large - modals and overlays
 */
export const shadowLarge = Platform.select({
	ios: {
		shadowColor: '#000',
		shadowOpacity: 0.2,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 8 },
	},
	android: {
		elevation: 8,
	},
});
