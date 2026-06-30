import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Switch, Text, View } from "react-native";
import { colors, shadow } from "@/theme/colors";
import type { BackendProperty } from "@/types/api";

type OwnerListingCardProps = {
  property: BackendProperty;
  onToggleAvailability: () => void;
};

function price(property: BackendProperty) {
  return `INR ${property.rentMonthly.toLocaleString("en-IN")}${property.category === "HOMESTAY" ? "/day" : "/mo"}`;
}

function statusLabel(property: BackendProperty) {
  if (property.status === "PUBLISHED") return "Published";
  if (property.status === "DRAFT") return "In review";
  if (property.status === "UNPUBLISHED") return "Unpublished";
  return "Archived";
}

export function OwnerListingCard({ property, onToggleAvailability }: OwnerListingCardProps) {
  const image = property.images[0]?.url;

  return (
    <View style={styles.card}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} contentFit="cover" transition={160} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={28} color={colors.primary} />
          <Text style={styles.placeholderText}>Photos pending</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.status}>{statusLabel(property)}</Text>
          <Text style={[styles.availability, property.isAvailable ? styles.available : styles.unavailable]}>
            {property.isAvailable ? "Available" : "Unavailable"}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
        <Text style={styles.meta}>{property.locality}, {property.city}</Text>
        <Text style={styles.price}>{price(property)}</Text>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleTitle}>Realtime availability</Text>
            <Text style={styles.toggleHelp}>No admin approval needed</Text>
          </View>
          <Switch value={property.isAvailable} onValueChange={onToggleAvailability} trackColor={{ true: "#BFEBD4", false: "#E5E7EB" }} thumbColor={property.isAvailable ? colors.success : "#9CA3AF"} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  image: {
    width: "100%",
    height: 165
  },
  placeholder: {
    height: 165,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF"
  },
  placeholderText: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: "900"
  },
  body: {
    padding: 16
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  status: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#EEF2FF",
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900"
  },
  availability: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "900"
  },
  available: {
    backgroundColor: "#E6F8EF",
    color: colors.success
  },
  unavailable: {
    backgroundColor: "#FFF3E1",
    color: colors.warning
  },
  title: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  meta: {
    marginTop: 7,
    color: colors.muted,
    fontWeight: "700"
  },
  price: {
    marginTop: 10,
    color: colors.brandRed,
    fontSize: 17,
    fontWeight: "900"
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "#F7F7FB"
  },
  toggleTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  toggleHelp: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12
  }
});
