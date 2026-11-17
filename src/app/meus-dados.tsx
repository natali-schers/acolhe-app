import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { AppText, Avatar, Button, Card, Icon, Screen, StatusTag, type IconName } from "@/components/ui";
import { QueryState } from "@/components/domain";
import { useAuth, useCurrentUser } from "@/contexts/AuthContext";
import { useCaregivers, usePatient } from "@/hooks/useCare";
import { useLogoutPrompt } from "@/hooks/useLogoutPrompt";
import { colors, spacing } from "@/theme";
import type { AccessibilityPrefs, Patient } from "@/types";

const textSizeLabels: Record<AccessibilityPrefs["textSize"], string> = {
  normal: "Normal",
  grande: "Grande",
  muito_grande: "Muito grande",
};

const NOT_INFORMED = "Não informado";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <AppText size="xl" bold accessibilityRole="header">{title}</AppText>
      <Card>{children}</Card>
    </View>
  );
}

/** Uma informação: ícone, rótulo e valor. Lida em voz alta como "Rótulo: valor". */
function DataRow({ icon, label, value, last = false }: { icon: IconName; label: string; value?: string; last?: boolean }) {
  const shown = value?.trim() ? value : NOT_INFORMED;
  return (
    <View style={[styles.row, !last && styles.divider]} accessible accessibilityLabel={`${label}: ${shown}`}>
      <Icon name={icon} color="textMuted" />
      <View style={{ flex: 1 }}>
        <AppText size="sm" color="textMuted">{label}</AppText>
        <AppText size="lg" bold={shown !== NOT_INFORMED} color={shown === NOT_INFORMED ? "textMuted" : "text"}>{shown}</AppText>
      </View>
    </View>
  );
}

/** Dados da pessoa cuidada: para ela mesma é "Meu perfil", para o cuidador é "Pessoa cuidada". */
function PatientSection({ patient, own }: { patient: Patient; own: boolean }) {
  return (
    <Section title={own ? "Meu perfil de cuidado" : "Pessoa cuidada"}>
      {!own && <DataRow icon="heart" label="Nome" value={patient.fullName} />}
      <DataRow icon="calendar" label="Idade" value={patient.age ? `${patient.age} anos` : undefined} />
      <DataRow icon="map-pin" label="Cidade" value={patient.city} />
      {!own && <DataRow icon="phone" label="Celular" value={patient.phone} />}
      <DataRow
        icon="key"
        label={own ? "Código para a família se conectar" : "Código de convite"}
        value={patient.inviteCode?.replace(/(\d{3})(\d{3})/, "$1 $2")}
        last
      />
    </Section>
  );
}

/** Contatos de apoio cadastrados pelo cuidador: só recebem alertas por WhatsApp/SMS. */
function SupportContacts({ patientId }: { patientId: string }) {
  const query = useCaregivers(patientId);
  return (
    <QueryState query={query}>
      {(list) => {
        const supports = list.filter((c) => c.level === "apoio");
        return (
          <Section title="Contatos de apoio">
            {supports.length === 0 ? (
              <AppText color="textMuted">Nenhum contato de apoio cadastrado.</AppText>
            ) : (
              supports.map((c, i) => (
                <View
                  key={c.id}
                  style={[styles.row, i < supports.length - 1 && styles.divider]}
                  accessible
                  accessibilityLabel={`${c.name}, ${c.phone || NOT_INFORMED}${c.status === "convite_pendente" ? ", convite enviado" : ""}`}
                >
                  <Avatar initials={c.initials} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText bold size="lg">{c.name}</AppText>
                    <AppText color="textMuted">{c.phone || NOT_INFORMED}</AppText>
                    {c.status === "convite_pendente" && <StatusTag label="Convite enviado" tone="warning" icon="clock" />}
                  </View>
                </View>
              ))
            )}
          </Section>
        );
      }}
    </QueryState>
  );
}

/** Meus dados: tudo o que a pessoa informou no cadastro (no app ou no portal web), lido da API. */
export default function MyDataScreen() {
  const { user } = useAuth();
  // Fora das abas não há o guarda do RoleTabs: ao sair da conta (ou sessão expirada), volta ao início.
  if (!user) return <Redirect href="/" />;
  return <MyData />;
}

function MyData() {
  const user = useCurrentUser();
  const patient = usePatient(user.patientId);
  const logoutPrompt = useLogoutPrompt();
  const isPessoa = user.role === "pessoa";

  const goBack = () => (router.canGoBack() ? router.back() : router.replace(isPessoa ? "/pessoa" : "/cuidador"));

  return (
    <Screen edges={["top", "bottom"]}>
      <Pressable onPress={goBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar">
        <Icon name="arrow-left" color="primary" />
        <AppText bold color="primary">Voltar</AppText>
      </Pressable>

      <View style={styles.header}>
        <Avatar initials={user.initials} size={64} />
        <View style={{ flex: 1 }}>
          <AppText color="textMuted">Meus dados</AppText>
          <AppText size="xxl" bold accessibilityRole="header">{user.displayName}</AppText>
          <StatusTag label={isPessoa ? "Pessoa cuidada" : "Cuidador(a)"} tone="primary" icon={isPessoa ? "heart" : "users"} />
        </View>
      </View>

      <Section title="Conta">
        <DataRow icon="user" label="Nome completo" value={user.name} />
        <DataRow icon="mail" label="E-mail" value={user.email} />
        <DataRow icon="smartphone" label="Celular" value={user.phone} last />
      </Section>

      {isPessoa && (
        <Section title="Como prefiro usar o app">
          <DataRow
            icon="type"
            label="Tamanho do texto"
            value={user.accessibility ? textSizeLabels[user.accessibility.textSize] : undefined}
          />
          <DataRow
            icon="volume-2"
            label="Lembretes em voz alta"
            value={user.accessibility ? (user.accessibility.voiceReminders ? "Ligados" : "Desligados") : undefined}
            last
          />
        </Section>
      )}

      <QueryState query={patient}>
        {(data) => <PatientSection patient={data} own={isPessoa} />}
      </QueryState>

      {!isPessoa && <SupportContacts patientId={user.patientId} />}

      <View style={styles.privacy}>
        <Icon name="lock" size={18} color="textMuted" />
        <AppText size="sm" color="textMuted" style={{ flex: 1 }}>Por segurança, sua senha não é exibida.</AppText>
      </View>

      <Button label="Sair da conta" variant="secondary" icon="log-out" onPress={logoutPrompt} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, marginBottom: 8, alignSelf: "flex-start" },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  privacy: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xl },
});
