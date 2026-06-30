import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { categories, type AppCategory } from "@/data/categories";
import { colors, shadow } from "@/theme/colors";

type CategoryGridProps = {
  activeKey?: string;
  onSelect: (item: AppCategory) => void;
};

export function CategoryGrid({ activeKey, onSelect }: CategoryGridProps) {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.key}
      numColumns={4}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => {
        const active = activeKey === item.key;
        return (
          <TouchableOpacity
            style={[styles.tile, active && styles.activeTile]}
            activeOpacity={0.86}
            onPress={() => onSelect(item)}
          >
            <View style={[styles.iconWrap, active && styles.activeIcon]}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={27} color="#fff" />
            </View>
            <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
    marginBottom: 12
  },
  tile: {
    flex: 1,
    minHeight: 108,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 22,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  activeTile: {
    backgroundColor: "#FFF4F5"
  },
  iconWrap: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    backgroundColor: colors.primary
  },
  activeIcon: {
    backgroundColor: colors.brandRed
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  activeLabel: {
    color: colors.brandRed
  }
});
