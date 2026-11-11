import { Stack } from "expo-router";
import { colors } from "@/theme";

export default function EmergencyLayout() {
  return <Stack screenOptions={{ headerShown: false, gestureEnabled: false, contentStyle: { backgroundColor: colors.background } }} />;
}
