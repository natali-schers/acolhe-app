import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold, useFonts,
} from "@expo-google-fonts/atkinson-hyperlegible";
import { AuthProvider } from "@/contexts/AuthContext";
import { EmergencyProvider } from "@/contexts/EmergencyContext";
import { colors } from "@/theme";
import "@/widgets";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <EmergencyProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="cadastro" />
              <Stack.Screen name="sos" options={{ animation: "none" }} />
              <Stack.Screen name="pessoa" />
              <Stack.Screen name="cuidador" />
              <Stack.Screen name="emergencia" options={{ presentation: "fullScreenModal", gestureEnabled: false }} />
              <Stack.Screen name="nova-anotacao" options={{ presentation: "modal" }} />
            </Stack>
          </EmergencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
