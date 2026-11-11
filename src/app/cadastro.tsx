import { useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { router } from "expo-router";
import { AppText, Button, Card, Eyebrow, Icon, IconBadge, InfoBanner, Screen, type IconName } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { patientService } from "@/services";
import { colors, fontFamily, fontSize, radius, spacing } from "@/theme";
import type { AccessibilityPrefs, Patient, RegisterInput } from "@/types";

const WEB_PORTAL_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:5173";

type Profile = "pessoa" | "cuidador" | "medico";
type Support = { name: string; phone: string };

function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <AppText bold style={{ marginBottom: 6 }}>{label}</AppText>
      {hint && <AppText size="sm" color="textMuted" style={{ marginBottom: 6 }}>{hint}</AppText>}
      <TextInput style={styles.input} accessibilityLabel={label} placeholderTextColor={colors.textMuted} {...props} />
    </View>
  );
}

function Choice({ icon, title, subtitle, selected, onPress }: { icon: IconName; title: string; subtitle: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: Boolean(selected) }}
      accessibilityLabel={`${title}. ${subtitle}`}
      style={[styles.choice, selected && { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}
    >
      <IconBadge name={icon} size={48} />
      <View style={{ flex: 1 }}>
        <AppText bold size="lg">{title}</AppText>
        <AppText color="textMuted">{subtitle}</AppText>
      </View>
      {selected ? <Icon name="check-circle" color="primary" /> : <Icon name="chevron-right" color="textMuted" />}
    </Pressable>
  );
}

function Progress({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <View accessible accessibilityLabel={`Passo ${step + 1} de ${total}: ${labels[step]}`} style={{ marginBottom: spacing.lg }}>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${((step + 1) / total) * 100}%` }]} />
      </View>
      <AppText size="sm" color="textMuted" style={{ marginTop: 6 }}>Passo {step + 1} de {total} · {labels[step]}</AppText>
    </View>
  );
}

function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: string }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={children}
      style={styles.checkRow}
    >
      <View style={[styles.box, checked && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
        {checked && <Icon name="check" size={18} color="textOnPrimary" />}
      </View>
      <AppText style={{ flex: 1 }}>{children}</AppText>
    </Pressable>
  );
}

const textSizes: { value: AccessibilityPrefs["textSize"]; label: string; size: number }[] = [
  { value: "normal", label: "Normal", size: 16 },
  { value: "grande", label: "Grande", size: 20 },
  { value: "muito_grande", label: "Muito grande", size: 24 },
];

export default function CadastroScreen() {
  const { register, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientCode, setPatientCode] = useState<string | null>(null);

  // dados
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  // vínculo
  const [code, setCode] = useState("");
  const [found, setFound] = useState<Patient | null>(null);
  const [searched, setSearched] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [pName, setPName] = useState("");
  const [pYear, setPYear] = useState("");
  const [pCity, setPCity] = useState("");
  const [own, setOwn] = useState(false);
  // apoio
  const [supports, setSupports] = useState<Support[]>([{ name: "", phone: "" }]);
  // acessibilidade
  const [textSize, setTextSize] = useState<AccessibilityPrefs["textSize"]>("grande");
  const [voice, setVoice] = useState(true);

  const isPessoa = profile === "pessoa";
  const labels = isPessoa
    ? ["Seus dados", "Quem cuida de você", "Como prefere usar", "Termos e atalho"]
    : ["Seus dados", "Termos", "Pessoa cuidada", "Contatos de apoio"];

  const back = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
    else if (profile) setProfile(null);
    else router.back();
  };

  const validData = () => {
    if (!name.trim() || !email.includes("@") || phone.replace(/\D/g, "").length < 10 || password.length < 6) {
      setError("Preencha nome, e-mail válido, celular com DDD e uma senha de pelo menos 6 caracteres.");
      return false;
    }
    return true;
  };

  const searchCode = async () => {
    setError(null);
    setBusy(true);
    try {
      setFound(await patientService.findByCode(code.trim()));
      setSearched(true);
    } catch {
      setError("Não foi possível buscar agora. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  const validLink = () => {
    if (found) return true;
    if (isPessoa && own) return pName.trim().length > 0 || name.trim().length > 0;
    if (!isPessoa && createNew) {
      if (!pName.trim() || pYear.length !== 4 || !pCity.trim()) { setError("Informe nome, ano de nascimento (4 dígitos) e cidade."); return false; }
      return true;
    }
    setError(isPessoa ? "Digite o código de 6 dígitos ou escolha criar o seu próprio perfil." : "Digite o código de 6 dígitos ou escolha cadastrar agora.");
    return false;
  };

  const next = () => {
    setError(null);
    if (step === 0 && !validData()) return;
    if (!isPessoa && step === 1 && !consent) { setError("Para continuar, aceite os termos."); return; }
    if (!isPessoa && step === 2 && !validLink()) return;
    if (isPessoa && step === 1 && !validLink()) return;
    setStep(step + 1);
  };

  const submit = async (skipSupports = false) => {
    setError(null);
    if (isPessoa && !consent) { setError("Para continuar, aceite os termos."); return; }
    setBusy(true);
    try {
      let input: RegisterInput;
      if (isPessoa) {
        input = {
          role: "pessoa", name, email, phone, password, accessibility: { textSize, voiceReminders: voice },
          ...(found ? { patientCode: code.trim() } : { newPatient: { birthYear: Number(pYear) || 1950, city: pCity.trim() || "São Paulo" } }),
        };
      } else {
        input = {
          role: "cuidador", name, email, phone, password,
          supportContacts: skipSupports ? [] : supports.filter((s) => s.name.trim() && s.phone.trim()),
          ...(found ? { patientCode: code.trim() } : { newPatient: { name: pName.trim(), birthYear: Number(pYear), city: pCity.trim() } }),
        };
      }
      const created = await register(input);
      if (created.patientId) {
        try { setPatientCode((await patientService.getById(created.patientId)).inviteCode ?? null); } catch { /* código é opcional na tela final */ }
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar a conta.");
    } finally {
      setBusy(false);
    }
  };

  const goHome = () => router.replace(isPessoa ? "/pessoa" : "/cuidador");

  // --- sucesso
  if (done) {
    return (
      <Screen edges={["top", "bottom"]}>
        <View style={{ alignItems: "center", gap: spacing.md, marginTop: spacing.xl }}>
          <IconBadge name="check" tone="success" size={80} round />
          <AppText size="display" bold center accessibilityRole="header">Conta criada!</AppText>
          <AppText size="lg" color="textMuted" center>
            {isPessoa ? `Bem-vindo(a), ${user?.displayName ?? name.split(" ")[0]}. Sua rede de cuidado já pode te encontrar.` : `Tudo pronto, ${user?.displayName ?? name.split(" ")[0]}. Você já faz parte da rede de cuidado.`}
          </AppText>
        </View>
        {patientCode && (
          <Card style={{ marginTop: spacing.xl, alignItems: "center", gap: 6 }}>
            <AppText color="textMuted">Código da pessoa cuidada</AppText>
            <AppText size="display" bold accessibilityLabel={`Código ${patientCode.split("").join(" ")}`} style={{ letterSpacing: 6 }}>{patientCode}</AppText>
            <AppText size="sm" color="textMuted" center>Compartilhe com quem for entrar na rede de cuidado.</AppText>
          </Card>
        )}
        {!isPessoa && supports.some((s) => s.name.trim()) && (
          <InfoBanner icon="message-circle" tone="info" title="Contatos de apoio avisados" description="Eles receberão um convite por mensagem. Não precisam instalar o app." />
        )}
        <Button label="Ir para o início" size="lg" onPress={goHome} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen edges={["top", "bottom"]}>
        <Pressable onPress={back} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar">
          <Icon name="arrow-left" color="primary" />
          <AppText bold color="primary">Voltar</AppText>
        </Pressable>

        {/* --- escolha de perfil */}
        {!profile && (
          <>
            <Eyebrow>Criar conta</Eyebrow>
            <AppText size="display" bold style={{ lineHeight: 38, marginBottom: spacing.sm }} accessibilityRole="header">Quem vai usar o Acolhe?</AppText>
            <AppText color="textMuted" style={{ marginBottom: spacing.lg }}>Escolha o seu papel. Isso muda só as perguntas que vamos fazer.</AppText>
            <View style={{ gap: spacing.md }} accessibilityRole="radiogroup">
              <Choice icon="heart" title="Sou a pessoa cuidada" subtitle="Quero ajuda rápida e lembretes" onPress={() => setProfile("pessoa")} />
              <Choice icon="users" title="Sou cuidador(a)" subtitle="Família, vizinho, amigo ou profissional" onPress={() => setProfile("cuidador")} />
              <Choice icon="activity" title="Sou médico(a)" subtitle="Receitas e acompanhamento" onPress={() => setProfile("medico")} />
            </View>
          </>
        )}

        {/* --- médico: área no computador */}
        {profile === "medico" && (
          <>
            <IconBadge name="monitor" size={64} />
            <AppText size="display" bold style={{ lineHeight: 38, marginTop: spacing.lg }} accessibilityRole="header">A área médica é no computador</AppText>
            <AppText size="lg" color="textMuted" style={{ marginVertical: spacing.md }}>
              Receitas, relatórios e acompanhamento ficam melhores numa tela grande. Crie sua conta pelo portal web, com CRM e verificação.
            </AppText>
            <Button label="Abrir o portal web" icon="external-link" size="lg" onPress={() => Linking.openURL(WEB_PORTAL_URL)} />
            <Button label="Escolher outro perfil" variant="ghost" onPress={() => setProfile(null)} />
          </>
        )}

        {/* --- fluxo pessoa / cuidador */}
        {(profile === "pessoa" || profile === "cuidador") && (
          <>
            <Progress step={step} total={4} labels={labels} />
            <AppText size="xxl" bold accessibilityRole="header">{labels[step]}</AppText>

            {step === 0 && (
              <>
                <Field label="Nome completo" value={name} onChangeText={setName} autoComplete="name" />
                <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
                <Field label="Celular com DDD" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="(11) 90000-0000" />
                <Field label="Senha" hint="Pelo menos 6 caracteres." value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
              </>
            )}

            {!isPessoa && step === 1 && (
              <>
                <AppText color="textMuted" style={{ marginVertical: spacing.md }}>
                  Você vai receber alertas de emergência e poderá ver a rotina de quem você cuida. Só vemos o que a família autorizar.
                </AppText>
                <CheckRow checked={consent} onChange={setConsent}>Aceito os termos de uso e a política de privacidade do Acolhe.</CheckRow>
              </>
            )}

            {((!isPessoa && step === 2) || (isPessoa && step === 1)) && (
              <>
                <AppText color="textMuted" style={{ marginVertical: spacing.md }}>
                  {isPessoa ? "Peça o código de 6 dígitos a quem cuida de você. Fica na tela de convite do cuidador." : "O código de 6 dígitos aparece no aplicativo da pessoa cuidada."}
                </AppText>
                <Field label="Código de 6 dígitos" value={code} onChangeText={(v) => { setCode(v.replace(/\D/g, "").slice(0, 6)); setSearched(false); setFound(null); }} keyboardType="number-pad" maxLength={6} placeholder="000000" />
                <Button label="Buscar" variant="secondary" icon="search" loading={busy} disabled={code.length !== 6} onPress={searchCode} style={{ marginTop: spacing.md }} />
                {found && <InfoBanner icon="check-circle" tone="success" title={`Encontramos ${found.name}`} description="Você será ligado(a) à rede de cuidado dessa pessoa." />}
                {searched && !found && <InfoBanner icon="alert-circle" tone="warning" title="Código não encontrado" description="Confira os números ou cadastre agora." />}
                {!found && (
                  <>
                    {isPessoa ? (
                      <CheckRow checked={own} onChange={setOwn}>Ainda não tenho código. Quero criar meu próprio perfil.</CheckRow>
                    ) : (
                      <CheckRow checked={createNew} onChange={setCreateNew}>Cadastrar a pessoa cuidada agora.</CheckRow>
                    )}
                    {((isPessoa && own) || (!isPessoa && createNew)) && (
                      <>
                        {!isPessoa && <Field label="Nome da pessoa cuidada" value={pName} onChangeText={setPName} />}
                        <Field label="Ano de nascimento" value={pYear} onChangeText={(v) => setPYear(v.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" maxLength={4} placeholder="1950" />
                        <Field label="Cidade" value={pCity} onChangeText={setPCity} />
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {!isPessoa && step === 3 && (
              <>
                <InfoBanner icon="message-circle" tone="info" title="Opcional" description="Contatos de apoio recebem o alerta por WhatsApp ou SMS. Não precisam instalar o app." />
                {supports.map((s, i) => (
                  <Card key={i} style={{ marginTop: spacing.md }}>
                    <AppText bold>Contato {i + 1}</AppText>
                    <Field label="Nome" value={s.name} onChangeText={(v) => setSupports((l) => l.map((x, j) => (j === i ? { ...x, name: v } : x)))} />
                    <Field label="Celular" value={s.phone} keyboardType="phone-pad" onChangeText={(v) => setSupports((l) => l.map((x, j) => (j === i ? { ...x, phone: v } : x)))} />
                  </Card>
                ))}
                {supports.length < 3 && (
                  <Button label="Adicionar outro contato" variant="secondary" icon="plus" onPress={() => setSupports((l) => [...l, { name: "", phone: "" }])} style={{ marginTop: spacing.md }} />
                )}
              </>
            )}

            {isPessoa && step === 2 && (
              <>
                <AppText bold style={{ marginTop: spacing.lg, marginBottom: 8 }}>Tamanho do texto</AppText>
                <View style={{ gap: spacing.sm }} accessibilityRole="radiogroup">
                  {textSizes.map((t) => (
                    <Pressable
                      key={t.value}
                      onPress={() => setTextSize(t.value)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: textSize === t.value }}
                      accessibilityLabel={t.label}
                      style={[styles.sizeOpt, textSize === t.value && { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}
                    >
                      <AppText bold style={{ fontSize: t.size }}>{t.label}</AppText>
                      {textSize === t.value && <Icon name="check-circle" color="primary" />}
                    </Pressable>
                  ))}
                </View>
                <View style={{ marginTop: spacing.lg }}>
                  <CheckRow checked={voice} onChange={setVoice}>Ler os lembretes em voz alta.</CheckRow>
                </View>
              </>
            )}

            {isPessoa && step === 3 && (
              <>
                <CheckRow checked={consent} onChange={setConsent}>Aceito os termos de uso e autorizo que minha rede de cuidado receba meus alertas.</CheckRow>
                <Card style={{ marginTop: spacing.lg, gap: 6 }}>
                  <AppText bold size="lg">Botão de ajuda na tela inicial</AppText>
                  <AppText color="textMuted">
                    {Platform.OS === "ios"
                      ? "Toque e segure um espaço vazio da tela, toque em “+” e escolha o widget “Acolhe SOS”."
                      : "Toque e segure um espaço vazio da tela, escolha “Widgets” e arraste o “Acolhe SOS”."}
                  </AppText>
                  <AppText size="sm" color="textMuted">Dá para fazer isso depois. Quem cuida de você também pode ajudar.</AppText>
                </Card>
              </>
            )}

            {error && <AppText bold color="danger" style={{ marginTop: spacing.lg }} accessibilityLiveRegion="polite">{error}</AppText>}

            <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
              {step < 3 ? (
                <Button label="Continuar" size="lg" onPress={next} />
              ) : (
                <>
                  <Button label="Criar conta" size="lg" loading={busy} onPress={() => submit()} />
                  {!isPessoa && <Button label="Pular e criar conta" variant="ghost" disabled={busy} onPress={() => submit(true)} />}
                </>
              )}
            </View>
          </>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, marginBottom: 12, alignSelf: "flex-start", minHeight: 48 },
  input: {
    minHeight: 54, borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: 16,
    backgroundColor: colors.surface, fontFamily: fontFamily.regular, fontSize: fontSize.lg, color: colors.text,
  },
  choice: {
    flexDirection: "row", alignItems: "center", gap: spacing.lg, minHeight: 80, padding: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg,
  },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: colors.primary },
  checkRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 56, paddingVertical: 8 },
  box: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  sizeOpt: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 60, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface,
  },
});
