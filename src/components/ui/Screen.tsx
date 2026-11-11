import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { AppText } from "./AppText";
import { Avatar } from "./Basics";
import { colors, spacing } from "@/theme";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Abas já cuidam da parte de baixo; telas cheias usam todas as bordas. */
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  background?: string;
}

/** Container padrão de tela: área segura + rolagem + margens. */
export function Screen({ children, scroll = true, edges = ["top"], contentStyle, background = colors.background }: ScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

interface ScreenHeaderProps {
  overline: string;
  title: string;
  avatar?: string;
  onAvatarPress?: () => void;
  action?: ReactNode;
}

/** Cabeçalho das abas: "Bom dia," + nome, com avatar ou ação à direita. */
export function ScreenHeader({ overline, title, avatar, onAvatarPress, action }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <AppText color="textMuted">{overline}</AppText>
        <AppText size="xxl" bold accessibilityRole="header">{title}</AppText>
      </View>
      {action}
      {avatar && (
        <Pressable onPress={onAvatarPress} accessibilityRole="button" accessibilityLabel="Abrir perfil e sair" hitSlop={8}>
          <Avatar initials={avatar} size={52} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl },
});
