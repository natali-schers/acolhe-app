import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

/** Pergunta antes de sair da conta (evita toques sem querer). */
export function useLogoutPrompt() {
  const { user, logout } = useAuth();
  return () => {
    const doLogout = () => {
      logout();
      router.replace("/");
    };
    if (Platform.OS === "web") {
      if (window.confirm("Deseja sair da conta?")) doLogout();
      return;
    }
    Alert.alert(user?.displayName ?? "Conta", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: doLogout },
    ]);
  };
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia," : h < 18 ? "Boa tarde," : "Boa noite,";
}
