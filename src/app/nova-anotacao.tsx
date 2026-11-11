import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { router } from "expo-router";
import { AppText, Button, Icon, Screen } from "@/components/ui";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useCreateNote } from "@/hooks/useCare";
import { colors, fontFamily, fontSize, radius, spacing } from "@/theme";
import type { CreateNoteInput } from "@/types";

const shortcuts: Omit<CreateNoteInput, "patientId">[] = [
  { title: "Tomou todos os remédios", description: "Todas as doses do dia foram tomadas.", type: "medicacao" },
  { title: "Passou mal após o remédio", description: "Relatou mal-estar depois de tomar o remédio.", type: "sintoma", warn: true },
  { title: "Parou o remédio sem falar com o médico", description: "Interrompeu o tratamento por conta própria.", type: "sintoma", warn: true },
  { title: "Fez uma caminhada", description: "", type: "atividade" },
];

/** Nova anotação na rotina (modal). Fica visível para a rede e para o médico. */
export default function NewNoteScreen() {
  const user = useCurrentUser();
  const createNote = useCreateNote(user.patientId, user.displayName);
  const [text, setText] = useState("");

  const save = async (input: Omit<CreateNoteInput, "patientId">) => {
    await createNote.mutateAsync(input);
    router.back();
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <Pressable onPress={() => router.back()} style={styles.close} accessibilityRole="button" accessibilityLabel="Fechar">
        <Icon name="x" size={26} />
      </Pressable>
      <AppText size="xxl" bold accessibilityRole="header">Nova anotação</AppText>
      <AppText size="lg" color="textMuted" style={{ marginBottom: spacing.lg }}>Escolha um atalho ou escreva o que aconteceu.</AppText>

      {shortcuts.map((s) => (
        <Pressable key={s.title} style={({ pressed }) => [styles.shortcut, pressed && { borderColor: colors.primary }]} onPress={() => save(s)} disabled={createNote.isPending} accessibilityRole="button">
          <AppText size="lg" style={{ flex: 1 }}>{s.title}</AppText>
          <Icon name="chevron-right" color="textMuted" />
        </Pressable>
      ))}

      <AppText bold style={{ marginTop: spacing.xl, marginBottom: 6 }}>Outra anotação</AppText>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Escreva aqui..."
        placeholderTextColor={colors.textSubtle}
        multiline
        accessibilityLabel="Outra anotação"
      />
      <Button
        label="Salvar anotação"
        size="lg"
        disabled={!text.trim()}
        loading={createNote.isPending}
        onPress={() => save({ title: text.trim(), description: "", type: "anotacao" })}
        style={{ marginTop: spacing.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: "flex-end", width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  shortcut: {
    flexDirection: "row", alignItems: "center", minHeight: 60, paddingHorizontal: 14, marginVertical: 5,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface,
  },
  input: {
    minHeight: 110, textAlignVertical: "top", borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.md,
    padding: 14, backgroundColor: colors.surface, fontFamily: fontFamily.regular, fontSize: fontSize.lg, color: colors.text,
  },
});
