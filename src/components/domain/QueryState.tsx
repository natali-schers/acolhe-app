import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import type { UseQueryResult } from "@tanstack/react-query";
import { AppText, Button } from "@/components/ui";
import { colors } from "@/theme";

/** Mostra carregando/erro e só desenha o conteúdo quando os dados chegam. */
export function QueryState<T>({ query, children }: { query: UseQueryResult<T>; children: (data: T) => ReactNode }) {
  if (query.isPending) {
    return <View style={{ padding: 24, alignItems: "center" }}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }
  if (query.isError) {
    return (
      <View style={{ padding: 24, alignItems: "center", gap: 12 }}>
        <AppText center color="textMuted">Não foi possível carregar. Verifique sua internet.</AppText>
        <Button label="Tentar de novo" variant="secondary" onPress={() => query.refetch()} />
      </View>
    );
  }
  return <>{children(query.data)}</>;
}
