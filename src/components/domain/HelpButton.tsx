import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { AppText, Icon } from "@/components/ui";
import { colors } from "@/theme";

/** Botão grande "PRECISO DE AJUDA" com pulso suave para chamar atenção. */
export function HelpButton({ onPress }: { onPress: () => void }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.halo, { transform: [{ scale }] }]} />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Preciso de ajuda"
        accessibilityHint="Começa uma contagem de 5 segundos e avisa sua rede de cuidadores"
        style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.97 }] }]}
      >
        <View style={styles.iconCircle}><Icon name="bell" size={40} color="textOnPrimary" /></View>
        <AppText size="xl" bold color="textOnPrimary" center style={{ fontSize: 26, lineHeight: 29 }}>PRECISO DE{"\n"}AJUDA</AppText>
        <AppText size="sm" color="textOnPrimary" center style={{ maxWidth: 150, marginTop: 4 }}>Toque para avisar sua rede</AppText>
      </Pressable>
    </View>
  );
}

const SIZE = 230;

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", height: SIZE + 30, marginVertical: 8 },
  halo: { position: "absolute", width: SIZE + 24, height: SIZE + 24, borderRadius: (SIZE + 24) / 2, backgroundColor: colors.dangerSoft },
  button: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.danger,
    borderWidth: 8, borderColor: colors.dangerBorder, alignItems: "center", justifyContent: "center",
  },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 6 },
});
