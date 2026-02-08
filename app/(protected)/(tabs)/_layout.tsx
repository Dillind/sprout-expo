import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="(home)" options={{ title: "Home", headerShown: false }} />
      <Tabs.Screen name="(my-garden)" options={{ title: "My Garden", headerShown: false }} />
      <Tabs.Screen name="(profile)" options={{ title: "Profile", headerShown: false }} />
    </Tabs>
  )
}