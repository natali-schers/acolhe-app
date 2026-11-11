import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { AppText, Brand, Button, Eyebrow, Icon, IconBadge, Screen, type IconName } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { colors, radius, spacing } from "@/theme";

const WEB_PORTAL_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:5173";

function RoleCard({ icon, title, subtitle, onPress }: { icon: IconName; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`} style={({ pressed }) => [styles.role, pressed && { borderColor: colors.primary }]}>
      <IconBadge name={icon} size={52} />
      <View style={{ flex: 1 }}>
        <AppText bold size="lg">{title}</AppText>
        <AppText color="textMuted">{subtitle}</AppText>
      </View>
      <Icon name="chevron-right" color="textMuted" />
    </Pressable>
  );
}

/** Boas-vindas: escolha de perfil. */
export default function WelcomeScreen() {
  const { user } = useAuth();
  if (user) return <Redirect href={user.role === "pessoa" ? "/pessoa" : "/cuidador"} />;

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={{ marginBottom: 40, marginTop: 12 }}><Brand /></View>
      <Eyebrow>Cuidado que aproxima</Eyebrow>
      <AppText size="display" bold style={{ lineHeight: 38, marginBottom: 12 }} accessibilityRole="header">Você nunca está só.</AppText>
      <AppText size="lg" color="textMuted" style={{ marginBottom: 28 }}>
        Ajuda rápida, rotina organizada e toda a rede de cuidado no mesmo lugar.
      </AppText>

      <View style={{ gap: spacing.md }}>
        <RoleCard icon="heart" title="Sou a pessoa cuidada" subtitle="Entrar no aplicativo" onPress={() => router.push({ pathname: "/login", params: { role: "pessoa" } })} />
        <RoleCard icon="users" title="Sou cuidador(a)" subtitle="Família, vizinhos e amigos" onPress={() => router.push({ pathname: "/login", params: { role: "cuidador" } })} />
      </View>

      <Button label="Criar conta" variant="secondary" icon="user-plus" onPress={() => router.push("/cadastro")} style={{ marginTop: spacing.lg }} />

      <View style={styles.privacy}>
        <Icon name="shield" size={18} color="textMuted" />
        <AppText size="sm" color="textMuted" style={{ flex: 1 }}>Seus dados de saúde são protegidos e só são vistos por quem você autorizar.</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  role: {
    flexDirection: "row", alignItems: "center", gap: spacing.lg, minHeight: 80, padding: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg,
  },
  privacy: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 32 },
});
