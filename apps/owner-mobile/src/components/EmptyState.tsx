import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type EmptyStateProps = {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({ title, body, icon = "home" }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={32} color={colors.primary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    borderRadius: 22,
    padding: 28,
    backgroundColor: colors.surface
  },
  title: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  body: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 21,
    textAlign: "center"
  }
});
