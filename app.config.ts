import 'dotenv/config';
import { ConfigContext, ExpoConfig } from 'expo/config';

const getConfig = ({ config }: ConfigContext): ExpoConfig => {
    // Read environment variable, default to development
    const APP_ENV = process.env.EXPO_PUBLIC_NODE_ENV || 'development';
    const isProd = APP_ENV === 'production';
    const appName = isProd ? 'sprout' : 'sprout-dev';
    const appSlug = isProd ? 'sprout' : 'sprout-dev';

    return {
        ...config,
        name: appName,
        slug: appSlug,
        version: '1.0.0',
        orientation: 'portrait',
        scheme: 'sproutapp',
        icon: './assets/images/icon.png',
        userInterfaceStyle: 'automatic',
        ios: {
            ...config.ios,
            supportsTablet: true,
            bundleIdentifier: isProd ? 'au.com.sprout.ios' : 'au.com.sprout.dev',
        },
        android: {
            package: isProd ? 'au.com.sprout.android' : 'au.com.sprout.dev',
            adaptiveIcon: {
                foregroundImage: './assets/images/icon.png',
                backgroundColor: '#ffffff',
            },
        },
        plugins: [
            ['expo-router', { root: 'src' }],
            'expo-font',
            'expo-image',
            [
                'expo-image-picker',
                {
                    photosPermission: '$(PRODUCT_NAME) accesses your photos to let you share them.',
                    cameraPermission:
                        '$(PRODUCT_NAME) accesses your camera to let you take photos.',
                },
            ],
            [
                'expo-secure-store',
                {
                    configureAndroidBackup: true,
                },
            ],
        ],
    };
};

export default getConfig;
