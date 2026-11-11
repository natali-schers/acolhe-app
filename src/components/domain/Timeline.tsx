import { StyleSheet, View } from "react-native";
import { AppText, Icon, type IconName } from "@/components/ui";
import { colors } from "@/theme";
import type { TimelineEntry, TimelineEntryType } from "@/types";
import { formatDayAndTime, formatTime, isSameDay } from "@/utils/date";

const icons: Record<TimelineEntryType, IconName> = {
  medicacao: "check",
  anotacao: "file-text",
  sintoma: "alert-triangle",
  atividade: "activity",
  alerta: "bell",
};

export function Timeline({ entries, showAuthor = true }: { entries: TimelineEntry[]; showAuthor?: boolean }) {
  return (
    <View>
      {entries.map((entry, index) => {
        const last = index === entries.length - 1;
        const time = isSameDay(new Date(entry.at), new Date()) ? formatTime(entry.at) : formatDayAndTime(entry.at);
        return (
          <View key={entry.id} style={styles.item} accessible accessibilityLabel={`${time}. ${entry.title}. ${entry.description}`}>
            <AppText size="sm" color="textMuted" style={styles.time}>{time}</AppText>
            <View style={styles.rail}>
              <View style={[styles.dot, entry.warn && styles.dotWarn]}>
                <Icon name={icons[entry.type]} size={15} color={entry.warn ? "warning" : "success"} />
              </View>
              {!last && <View style={styles.line} />}
            </View>
            <View style={styles.body}>
              <AppText bold>{entry.title}</AppText>
              {!!entry.description && <AppText color="textMuted">{entry.description}</AppText>}
              {showAuthor && (
                <AppText size="sm" color="textSubtle">
                  {entry.type === "medicacao" ? "Confirmado por" : "Adicionado por"} {entry.authorName}
                </AppText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", minHeight: 84 },
  time: { width: 56, paddingTop: 4 },
  rail: { width: 30, alignItems: "center" },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" },
  dotWarn: { backgroundColor: colors.warningSoft },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  body: { flex: 1, paddingLeft: 10, paddingBottom: 16, gap: 2 },
});
