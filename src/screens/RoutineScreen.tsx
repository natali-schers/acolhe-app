import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { AppText, Icon, Screen, ScreenHeader } from "@/components/ui";
import { QueryState, Timeline } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useTimeline } from "@/hooks/useCare";
import { colors, radius, spacing } from "@/theme";

/** Rotina compartilhada pelos dois perfis: linha do tempo + botão de nova anotação. */
export function RoutineScreen() {
  const user = useCurrentUser();
  const query = useTimeline(user.patientId);

  return (
    <Screen>
      <ScreenHeader
        overline="Acompanhamento"
        title="Rotina"
        action={
          <Pressable style={styles.add} onPress={() => router.push("/nova-anotacao")} accessibilityRole="button" accessibilityLabel="Adicionar anotação">
            <Icon name="plus" color="textOnPrimary" />
            <AppText bold color="textOnPrimary">Adicionar</AppText>
          </Pressable>
        }
      />
      <AppText size="xs" bold color="textMuted" style={{ marginBottom: spacing.lg, letterSpacing: 1 }}>
        {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" }).toUpperCase()}
      </AppText>
      <QueryState query={query}>{(entries) => <Timeline entries={entries} />}</QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 14, minHeight: 48 },
});
