import { Tabs } from "expo-router";

export default function ProtectedLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
    </Tabs>
  )
}