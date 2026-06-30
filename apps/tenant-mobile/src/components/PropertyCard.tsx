import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, shadow } from "@/theme/colors";
import type { BackendProperty } from "@/types/api";

type PropertyCardProps = {
  property: BackendProperty;
  onPress: () => void;
  onWhatsApp: () => void;
};

function formatPrice(property: BackendProperty) {
  const period = property.category === "HOMESTAY" ? "/day" : "/mo";
  return `INR ${property.rentMonthly.toLocaleString("en-IN")}${period}`;
}

export function PropertyCard({ property, onPress, onWhatsApp }: PropertyCardProps) {
  const image = property.images?.[0]?.url;
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} contentFit="cover" transition={180} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image" size={28} color={colors.primary} />
          <Text style={styles.placeholderText}>Photos pending</Text>
        </View>
      )}
      <View style={styles.badgeRow}>
        <Text style={[styles.badge, property.isAvailable ? styles.available : styles.reserved]}>
          {property.isAvailable ? "Available" : "Reserved"}
        </Text>
        {property.isVerified ? <Text style={styles.verified}>Verified</Text> : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          <Ionicons name="location" size={13} color={colors.brandRed} /> {property.locality}, {property.city}
        </Text>
        <View style={styles.amenities}>
          {amenities.slice(0, 3).map((item) => (
            <Text key={item} style={styles.amenity} numberOfLines={1}>{item}</Text>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(property)}</Text>
          <TouchableOpacity style={styles.whatsapp} onPress={onWhatsApp} activeOpacity={0.85}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  image: {
    width: "100%",
    height: 190
  },
  placeholder: {
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF"
  },
  placeholderText: {
    marginTop: 6,
    color: colors.primary,
    fontWeight: "900"
  },
  badgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 8
  },
  badge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#fff",
    fontSize: 11,
    fontWeight: "900"
  },
  available: {
    backgroundColor: colors.success
  },
  reserved: {
    backgroundColor: colors.warning
  },
  verified: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    color: "#fff",
    fontSize: 11,
    fontWeight: "900"
  },
  body: {
    padding: 16
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22
  },
  meta: {
    marginTop: 8,
    color: colors.muted,
    fontWeight: "700"
  },
  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  amenity: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#F1F5F9",
    color: colors.text,
    fontSize: 11,
    fontWeight: "800"
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14
  },
  price: {
    color: colors.brandRed,
    fontSize: 17,
    fontWeight: "900"
  },
  whatsapp: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#21A67A"
  }
});
