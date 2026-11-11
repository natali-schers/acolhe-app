import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiConfig } from "@/services";
import { colors } from "@/theme";

/**
 * Rota aberta pelo link acolhe://sos — usado pelo widget da tela inicial (Android e iPhone).
 * Leva direto para a contagem de 5 segundos, onde ainda dá para cancelar.
 */
export default function SosEntry() {
  const { user, loginAsDemo } = useAuth();

  useEffect(() => {
    const go = async () => {
      let current = user;
      // Sem backend, entra como a pessoa da demonstração. Com backend, a sessão já estará salva no aparelho.
      if (!current && apiConfig.useMocks) current = await loginAsDemo("pessoa");
      if (!current) return router.replace("/");
      if (current.role !== "pessoa") return router.replace("/cuidador");
      router.replace("/pessoa");
      router.push("/emergencia/contagem");
    };
    go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.danger }}>
      <ActivityIndicator color={colors.textOnPrimary} size="large" />
    </View>
  );
}
