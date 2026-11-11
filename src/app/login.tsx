import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppText, Button, Eyebrow, Icon, Screen } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { apiConfig } from "@/services";
import { colors, fontFamily, fontSize, radius, spacing } from "@/theme";
import type { AppRole } from "@/types";

export default function LoginScreen() {
  const { role = "pessoa" } = useLocalSearchParams<{ role?: AppRole }>();
  const { login, loginAsDemo } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goHome = (r: AppRole) => router.replace(r === "pessoa" ? "/pessoa" : "/cuidador");

  const run = async (action: () => Promise<{ role: AppRole }>) => {
    setError(null);
    setLoading(true);
    try {
      goHome((await action()).role);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen edges={["top", "bottom"]}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar">
          <Icon name="arrow-left" color="primary" />
          <AppText bold color="primary">Voltar</AppText>
        </Pressable>
        <Eyebrow>Bem-vindo de volta</Eyebrow>
        <AppText size="display" bold accessibilityRole="header" style={{ lineHeight: 38 }}>Entre na sua conta</AppText>
        <AppText color="textMuted" style={{ marginBottom: spacing.lg }}>
          {role === "pessoa" ? "Entrando como pessoa cuidada." : "Entrando como cuidador(a)."}
        </AppText>

        <AppText bold style={styles.label}>E-mail ou celular</AppText>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          accessibilityLabel="E-mail ou celular"
        />
        <AppText bold style={styles.label}>Senha</AppText>
        <View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            accessibilityLabel="Senha"
          />
          <Pressable style={styles.eye} onPress={() => setShowPassword((v) => !v)} accessibilityRole="button" accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}>
            <Icon name={showPassword ? "eye-off" : "eye"} color="textMuted" />
          </Pressable>
        </View>
        {error && <AppText bold color="danger" style={{ marginTop: spacing.sm }} accessibilityLiveRegion="polite">{error}</AppText>}

        <Button label="Entrar" size="lg" loading={loading} onPress={() => run(() => login(identifier, password))} style={{ marginTop: spacing.xl }} />
        <Button label="Esqueci minha senha" variant="ghost" />
        <Button label="Não tenho conta. Criar conta" variant="ghost" onPress={() => router.push("/cadastro")} />

        {apiConfig.useMocks && (
          <View style={styles.demo}>
            <AppText size="sm" color="textMuted" center>Modo demonstração (sem backend)</AppText>
            <Button
              label={role === "pessoa" ? "Entrar como Dona Maria" : "Entrar como Ana (filha)"}
              variant="secondary"
              icon="play-circle"
              onPress={() => run(() => loginAsDemo(role))}
            />
          </View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, marginBottom: 16, alignSelf: "flex-start" },
  label: { marginTop: spacing.lg, marginBottom: 6 },
  input: {
    minHeight: 54, borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: 16,
    backgroundColor: colors.surface, fontFamily: fontFamily.regular, fontSize: fontSize.lg, color: colors.text,
  },
  eye: { position: "absolute", right: 4, top: 4, width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  demo: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
});
