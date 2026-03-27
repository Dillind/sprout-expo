import CalendarIcon from '@/src/assets/icons/tab-icons/calendar-icon';
import HomeIcon from '@/src/assets/icons/tab-icons/home-icon';
import MyGardenIcon from '@/src/assets/icons/tab-icons/my-garden-icon';
import ProfileIcon from '@/src/assets/icons/tab-icons/profile-icon';
import { HapticTab } from '@/src/components/haptic-tab';
import { COLORS, FONTS } from '@/src/constants/theme';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: FONTS.InterRegular,
                },
                tabBarStyle: {
                    paddingTop: 5,
                },
                sceneStyle: {
                    backgroundColor: COLORS.white,
                },
            }}
            initialRouteName="(home)"
        >
            <Tabs.Screen
                name="(home)"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <HomeIcon color={color} />,
                }}
            />
            <Tabs.Screen
                name="(calendar)"
                options={{
                    title: 'Calendar',
                    tabBarIcon: ({ color }) => <CalendarIcon color={color} />,
                }}
            />
            <Tabs.Screen
                name="(my-garden)"
                options={{
                    title: 'My Garden',
                    tabBarIcon: ({ color }) => <MyGardenIcon color={color} />,
                }}
            />
            <Tabs.Screen
                name="(profile)"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
                }}
            />
        </Tabs>
    );
}
