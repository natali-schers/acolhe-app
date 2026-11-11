import { Linking, Pressable, StyleSheet, View } from "react-native";
import { AppText, Avatar, Icon, InfoBanner, Screen, ScreenHeader, StatusTag } from "@/components/ui";
import { channelsText, ChannelTag, QueryState } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useCaregivers } from "@/hooks/useCare";
import { colors, spacing } from "@/theme";
import type { Caregiver } from "@/types";

function Person({ c, position }: { c: Caregiver; position: number }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.person, pressed && { backgroundColor: colors.primarySoft }]}
      onPress={() => Linking.openURL(`tel:${c.phone.replace(/\D/g, "")}`)}
      accessibilityRole="button"
      accessibilityLabel={`${position}º: ${c.name}, ${c.relation}. Avisado por ${channelsText(c.channels)}, espera ${c.waitMinutes} minutos. Toque para ligar.`}
    >
      <AppText bold size="lg" color="primary" style={{ width: 28 }}>{position}º</AppText>
      <Avatar initials={c.initials} />
      <View style={{ flex: 1, gap: 4 }}>
        <AppText bold size="lg">{c.name}</AppText>
        <AppText color="textMuted">{c.relation}</AppText>
        <View style={styles.channels}>
          {c.channels.map((channel, i) => <ChannelTag key={channel} channel={channel} tone={i === 0 ? "info" : "neutral"} />)}
        </View>
        <AppText size="xs" color="textMuted">Espera {c.waitMinutes} min antes de avisar o próximo</AppText>
        {c.status === "convite_pendente" && <StatusTag label="Convite enviado" tone="warning" icon="clock" />}
      </View>
      <Icon name="phone" color="primary" />
    </Pressable>
  );
}

function Group({ title, description, list }: { title: string; description: string; list: Caregiver[] }) {
  if (list.length === 0) return null;
  return (
    <View style={{ marginTop: spacing.xl }}>
      <AppText size="xl" bold accessibilityRole="header">{title}</AppText>
      <AppText color="textMuted" style={{ marginBottom: spacing.sm }}>{description}</AppText>
      {list.map((c, i) => <Person key={c.id} c={c} position={i + 1} />)}
    </View>
  );
}

/** Rede de cuidado: cuidadores (usam o app) e contatos de apoio (só recebem alertas). Tocar numa pessoa liga para ela. */
export function NetworkScreen() {
  const user = useCurrentUser();
  const query = useCaregivers(user.patientId);
  const isPessoa = user.role === "pessoa";

  return (
    <Screen>
      <ScreenHeader overline={isPessoa ? "Quem está com você" : "Quem cuida da Dona Maria"} title="Rede de cuidado" />
      <QueryState query={query}>
        {(list) => {
          const active = list.filter((c) => c.status === "ativo");
          return (
            <>
              <InfoBanner
                icon="users"
                tone="primary"
                title={`${active.length} pessoas na rede`}
                description="Os alertas chamam primeiro os cuidadores, depois os contatos de apoio."
              />
              <Group
                title="Cuidadores"
                description="Usam o aplicativo e acompanham a rotina."
                list={list.filter((c) => c.level === "cuidador")}
              />
              <Group
                title="Contatos de apoio"
                description="Só ajudam em emergências. Recebem o alerta por WhatsApp ou SMS, sem instalar nada."
                list={list.filter((c) => c.level === "apoio")}
              />
              <AppText size="sm" color="textMuted" center style={{ marginTop: spacing.lg }}>
                Para convidar ou mudar a ordem, use o portal web da família.
              </AppText>
            </>
          );
        }}
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  person: {
    flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 14, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 76,
  },
  channels: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
