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
        icon: './src/assets/images/icon.png',
        userInterfaceStyle: 'automatic',
        ios: {
            ...config.ios,
            supportsTablet: true,
            bundleIdentifier: isProd ? 'au.com.sprout.ios' : 'au.com.sprout.dev',
            infoPlist: {
                NSUserNotificationUsageDescription: '$(PRODUCT_NAME) sends reminders when your plants need care.',
            },
        },
        android: {
            package: isProd ? 'au.com.sprout.android' : 'au.com.sprout.dev',
            // googleServicesFile: './google-services.json',
            adaptiveIcon: {
                foregroundImage: './src/assets/images/icon.png',
                backgroundColor: '#ffffff',
            },
        },
        web: { output: 'server' },
        plugins: [
            'expo-router',
            [
                'expo-notifications',
                {
                    iosDisplayInForeground: true,
                },
            ],
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
            'expo-apple-authentication',
            [
                '@react-native-google-signin/google-signin',
                {
                    iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
                },
            ],
        ],
        extra: {
            eas: {
                projectId: isProd ? '' : '216d5193-66c2-4303-a4ea-61e5dcbbf68e',
            },
        },
    };
};

export default getConfig;
