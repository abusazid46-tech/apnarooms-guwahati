import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/theme/colors";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function SectionHeader({ eyebrow, title, icon = "menu", onPress }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {onPress ? (
        <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.85}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  title: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  action: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.surface
  }
});
