import { COLORS } from '@/src/constants/theme';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
    return (
        <NativeTabs
            disableTransparentOnScrollEdge={true}
            tintColor={COLORS.primary}
            minimizeBehavior="onScrollDown"
        >
            <NativeTabs.Trigger name="(home)">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf={'house.fill'} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="calendar">
                <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf={'calendar'} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="my-garden">
                <NativeTabs.Trigger.Label>My Garden</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf={'leaf.fill'} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="profile">
                <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf={'person.fill'} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="add-plant" role="search">
                <NativeTabs.Trigger.Label>Add Plant</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    sf={{ default: 'plus.app.fill', selected: 'plus.app.fill' }}
                />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
