import { useEffect, useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Pressable, StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Redirect, router } from "expo-router";
import {
  AppText, Avatar, Button, Card, CheckRow, Field, Icon, OptionGroup, Screen, StatusTag, type IconName,
} from "@/components/ui";
import { QueryState, TextSizeLabel } from "@/components/domain";
import { useAuth, useCurrentUser } from "@/contexts/AuthContext";
import { useCaregivers, usePatient, useUpdateAddress } from "@/hooks/useCare";
import { useLogoutPrompt } from "@/hooks/useLogoutPrompt";
import { colors, spacing } from "@/theme";
import type { AccessibilityPrefs, AppUser, Patient } from "@/types";
import { formatZip, isValidZip } from "@/utils/address";
import { formatPhone, isValidPhone } from "@/utils/phone";
import { textSizeOptions, voiceVolumeOptions, withDefaults } from "@/utils/preferences";
import { speak } from "@/utils/speech";

const NOT_INFORMED = "Não informado";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const errorMessage = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <View style={styles.sectionHeader}>
        <AppText size="xl" bold accessibilityRole="header" style={{ flex: 1 }}>{title}</AppText>
        {action}
      </View>
      <Card>{children}</Card>
    </View>
  );
}

/** Botão "Alterar" no título da seção. O rótulo falado diz o que vai ser alterado. */
function EditButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.edit} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}>
      <Icon name="edit-2" size={18} color="primary" />
      <AppText bold color="primary">Alterar</AppText>
    </Pressable>
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

function FormMessage({ error, success }: { error?: string | null; success?: string | null }) {
  if (error) return <AppText bold color="danger" style={{ marginTop: spacing.md }} accessibilityLiveRegion="polite">{error}</AppText>;
  if (success) {
    return (
      <View style={styles.success} accessibilityLiveRegion="polite">
        <Icon name="check-circle" size={20} color="success" />
        <AppText bold color="success" style={{ flex: 1 }}>{success}</AppText>
      </View>
    );
  }
  return null;
}

function FormActions({ busy, onSave, onCancel }: { busy: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
      <Button label="Salvar" icon="check" loading={busy} onPress={onSave} />
      <Button label="Cancelar" variant="ghost" disabled={busy} onPress={onCancel} />
    </View>
  );
}

/** Mensagem de sucesso que some sozinha depois de alguns segundos. */
function useFlash() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);
  return [message, setMessage] as const;
}

/** Nome (só leitura), e-mail e celular. E-mail e celular são usados para entrar no app. */
function AccountSection({ user }: { user: AppUser }) {
  const { updateAccount } = useAuth();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useFlash();

  const start = () => {
    setEmail(user.email ?? "");
    setPhone(formatPhone(user.phone ?? ""));
    setError(null);
    setSaved(null);
    setEditing(true);
  };

  const save = async () => {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) return setError("Confira o e-mail: ele precisa ter @ e um domínio, como nome@exemplo.com.");
    if (!isValidPhone(phone)) return setError("Informe o celular com DDD, como (11) 90000-0000.");
    setBusy(true);
    try {
      await updateAccount({ email: email.trim(), phone });
      setEditing(false);
      setSaved("E-mail e celular atualizados. Use os novos dados na próxima vez que entrar.");
    } catch (e) {
      setError(errorMessage(e, "Não foi possível salvar agora. Tente de novo."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title="Conta" action={!editing && <EditButton label="Alterar e-mail e celular" onPress={start} />}>
      <DataRow icon="user" label="Nome completo" value={user.name} last={editing} />
      {editing ? (
        <>
          <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" />
          <Field label="Celular com DDD" value={phone} onChangeText={(v) => setPhone(formatPhone(v))} keyboardType="phone-pad" autoComplete="tel" placeholder="(11) 90000-0000" />
          <FormMessage error={error} />
          <FormActions busy={busy} onSave={save} onCancel={() => setEditing(false)} />
        </>
      ) : (
        <>
          <DataRow icon="mail" label="E-mail" value={user.email} />
          <DataRow icon="smartphone" label="Celular" value={user.phone} last />
          <FormMessage success={saved} />
        </>
      )}
    </Section>
  );
}

/** Tamanho do texto, lembretes em voz alta e volume. Cada toque já salva e vale na hora. */
function PreferencesSection({ user }: { user: AppUser }) {
  const { updateAccount } = useAuth();
  const prefs = withDefaults(user.accessibility);
  // Mostra a escolha na hora do toque, antes de a API confirmar.
  const [pending, setPending] = useState<Partial<AccessibilityPrefs> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shown = { ...prefs, ...pending };

  const save = async (change: Partial<AccessibilityPrefs>) => {
    setError(null);
    setPending(change);
    try {
      await updateAccount({ accessibility: change });
    } catch (e) {
      setError(errorMessage(e, "Não foi possível salvar a preferência. Tente de novo."));
    } finally {
      setPending(null);
    }
  };

  return (
    <Section title="Como prefiro usar o app">
      <AppText bold style={{ marginBottom: spacing.sm }}>Tamanho do texto</AppText>
      <OptionGroup
        options={textSizeOptions}
        value={shown.textSize}
        onChange={(textSize) => save({ textSize })}
        disabled={Boolean(pending)}
        renderLabel={(o) => <TextSizeLabel option={o} />}
      />

      <View style={[styles.divider, { marginVertical: spacing.lg }]} />

      <CheckRow checked={shown.voiceReminders} onChange={(voiceReminders) => save({ voiceReminders })} disabled={Boolean(pending)}>
        Ler os lembretes em voz alta
      </CheckRow>

      <AppText bold style={{ marginTop: spacing.md, marginBottom: 4 }}>Volume da voz</AppText>
      <AppText size="sm" color="textMuted" style={{ marginBottom: spacing.sm }}>
        Depende também do volume do celular. Se ainda estiver baixo, aumente nos botões laterais.
      </AppText>
      <OptionGroup options={voiceVolumeOptions} value={shown.voiceVolume} onChange={(voiceVolume) => save({ voiceVolume })} disabled={Boolean(pending)} />
      <Button
        label="Testar a voz"
        icon="volume-2"
        variant="secondary"
        onPress={() => speak("Olá! É assim que vou ler os seus lembretes.", shown.voiceVolume)}
        style={{ marginTop: spacing.md }}
      />
      <FormMessage error={error} />
    </Section>
  );
}

/** Formulário do endereço completo. Endereço antigo (só uma linha, sem partes) vem para o campo "Rua". */
function AddressForm({ patient, onDone }: { patient: Patient; onDone: (saved: boolean) => void }) {
  const update = useUpdateAddress(patient.id);
  const d = patient.addressDetails ?? {};
  const hasParts = Boolean(d.street || d.number || d.district || d.zipCode || d.complement);
  const [zipCode, setZipCode] = useState(d.zipCode ?? "");
  const [street, setStreet] = useState(hasParts ? (d.street ?? "") : patient.address);
  const [number, setNumber] = useState(d.number ?? "");
  const [complement, setComplement] = useState(d.complement ?? "");
  const [district, setDistrict] = useState(d.district ?? "");
  const [city, setCity] = useState(patient.city);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    if (!isValidZip(zipCode)) return setError("O CEP precisa ter 8 números, ou deixe em branco.");
    if (!street.trim() || !city.trim()) return setError("Informe pelo menos a rua e a cidade.");
    try {
      await update.mutateAsync({ zipCode, street, number, complement, district, city });
      onDone(true);
    } catch (e) {
      setError(errorMessage(e, "Não foi possível salvar o endereço. Tente de novo."));
    }
  };

  return (
    <>
      <AppText color="textMuted">
        É este endereço que a rede de cuidado recebe num pedido de ajuda. Confira com atenção.
      </AppText>
      <Field label="CEP" hint="Opcional." value={zipCode} onChangeText={(v) => setZipCode(formatZip(v))} keyboardType="number-pad" autoComplete="postal-code" placeholder="00000-000" maxLength={9} />
      <Field label="Rua ou avenida" value={street} onChangeText={setStreet} autoComplete="street-address" />
      <Field label="Número" hint="Sem número? Escreva s/n." value={number} onChangeText={setNumber} />
      <Field label="Complemento" hint="Opcional. Ex.: apto 12, bloco B, casa 2." value={complement} onChangeText={setComplement} />
      <Field label="Bairro" value={district} onChangeText={setDistrict} />
      <Field label="Cidade" hint="Ex.: Campinas, SP" value={city} onChangeText={setCity} />
      <FormMessage error={error} />
      <FormActions busy={update.isPending} onSave={save} onCancel={() => onDone(false)} />
    </>
  );
}

/** Código de 6 dígitos com botão para copiar e colar numa mensagem para a família. */
function InviteCodeRow({ code, label }: { code?: string; label: string }) {
  const [copied, setCopied] = useFlash();
  const pretty = code?.replace(/(\d{3})(\d{3})/, "$1 $2");

  const copy = async () => {
    if (!code) return;
    try {
      await Clipboard.setStringAsync(code);
      setCopied("Código copiado! Agora é só colar numa mensagem para a família.");
    } catch {
      setCopied(null);
    }
  };

  return (
    <View style={styles.row}>
      <Icon name="key" color="textMuted" />
      <View style={{ flex: 1, gap: spacing.sm }}>
        <View accessible accessibilityLabel={`${label}: ${code ? code.split("").join(" ") : NOT_INFORMED}`}>
          <AppText size="sm" color="textMuted">{label}</AppText>
          <AppText size="xl" bold color={code ? "text" : "textMuted"} style={code ? { letterSpacing: 2 } : undefined}>{pretty ?? NOT_INFORMED}</AppText>
        </View>
        {code && (
          <Button
            label={copied ? "Copiado" : "Copiar código"}
            icon={copied ? "check" : "copy"}
            variant="secondary"
            onPress={copy}
            accessibilityHint="Copia o código para você colar numa mensagem"
          />
        )}
        <FormMessage success={copied} />
      </View>
    </View>
  );
}

/** Dados da pessoa cuidada: para ela mesma é "Meu perfil", para o cuidador é "Pessoa cuidada". */
function PatientSection({ patient, own }: { patient: Patient; own: boolean }) {
  const [editingAddress, setEditingAddress] = useState(false);
  const [saved, setSaved] = useFlash();

  return (
    <>
      <Section title={own ? "Meu perfil de cuidado" : "Pessoa cuidada"}>
        {!own && <DataRow icon="heart" label="Nome" value={patient.fullName} />}
        <DataRow icon="calendar" label="Idade" value={patient.age ? `${patient.age} anos` : undefined} />
        {!own && <DataRow icon="phone" label="Celular" value={patient.phone} />}
        <InviteCodeRow code={patient.inviteCode} label={own ? "Código para a família se conectar" : "Código de convite"} />
      </Section>

      <Section
        title={own ? "Meu endereço" : "Endereço da pessoa cuidada"}
        action={!editingAddress && <EditButton label="Alterar endereço" onPress={() => { setSaved(null); setEditingAddress(true); }} />}
      >
        {editingAddress ? (
          <AddressForm
            patient={patient}
            onDone={(ok) => {
              setEditingAddress(false);
              if (ok) setSaved("Endereço atualizado.");
            }}
          />
        ) : (
          <>
            <DataRow icon="map-pin" label="Endereço" value={patient.address} />
            <DataRow icon="map" label="Cidade" value={patient.city} />
            <DataRow icon="hash" label="CEP" value={patient.addressDetails?.zipCode} last />
            <FormMessage success={saved} />
          </>
        )}
      </Section>
    </>
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

/** Meus dados: o que a pessoa informou no cadastro (no app ou no portal web), com o que dá para alterar aqui mesmo. */
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
    // Android é edge-to-edge (a janela não encolhe com o teclado): "padding" nas duas plataformas, como no cadastro.
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
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

        <AccountSection user={user} />

        {isPessoa && <PreferencesSection user={user} />}

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, marginBottom: 8, alignSelf: "flex-start" },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  edit: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 48, paddingHorizontal: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  success: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  privacy: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xl },
});
