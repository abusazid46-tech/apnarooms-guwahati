import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { useProperties } from "@/hooks/useProperties";
import { openPropertyCheckout, openWhatsAppBooking } from "@/services/payments";
import { colors } from "@/theme/colors";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties, loading } = useProperties();
  const property = properties.find((item) => item.id === id);

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </AppScreen>
    );
  }

  if (!property) {
    return (
      <AppScreen>
        <View style={styles.content}>
          <EmptyState title="Property not found" body="This listing may no longer be available." icon="alert-circle" />
        </View>
      </AppScreen>
    );
  }

  const image = property.images?.[0]?.url;
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {image ? (
          <Image source={{ uri: image }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="image" size={42} color={colors.primary} />
          </View>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.meta}>{property.locality}, {property.city}</Text>
          <Text style={styles.price}>INR {property.rentMonthly.toLocaleString("en-IN")}{property.category === "HOMESTAY" ? "/day" : "/mo"}</Text>
          {property.description ? <Text style={styles.description}>{property.description}</Text> : null}
          <View style={styles.amenities}>
            {amenities.map((item) => (
              <Text key={item} style={styles.amenity}>{item}</Text>
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.action, styles.whatsapp]} onPress={() => openWhatsAppBooking(property)}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.actionText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => openPropertyCheckout(property)} disabled={!property.isAvailable}>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.actionText}>{property.isAvailable ? "Book Token" : "Reserved"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  heroImage: {
    width: "100%",
    height: 330
  },
  heroPlaceholder: {
    height: 330,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF"
  },
  backButton: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#fff"
  },
  content: {
    padding: 20
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32
  },
  meta: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700"
  },
  price: {
    marginTop: 14,
    color: colors.brandRed,
    fontSize: 24,
    fontWeight: "900"
  },
  description: {
    marginTop: 16,
    color: colors.text,
    lineHeight: 23
  },
  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18
  },
  amenity: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    color: colors.text,
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24
  },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: colors.primary
  },
  whatsapp: {
    backgroundColor: "#21A67A"
  },
  actionText: {
    color: "#fff",
    fontWeight: "900"
  }
});
