import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { useProperties } from "@/hooks/useProperties";
import { createBookingRequest } from "@/services/bookingRequests";
import { openPropertyCheckout, openWhatsAppBooking } from "@/services/payments";
import { colors } from "@/theme/colors";
import { useState } from "react";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties, loading } = useProperties();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
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

  async function submitBookingRequest() {
    if (!property) return;

    if (!form.name.trim() && !form.phone.trim() && !form.email.trim()) {
      Alert.alert("Contact needed", "Add your name, phone, or email so ApnaRooms can contact you.");
      return;
    }

    setSubmitting(true);
    try {
      await createBookingRequest(property, form);
      setForm({ name: "", phone: "", email: "", message: "" });
      Alert.alert("Request sent", "ApnaRooms received your booking request for this live property.");
    } catch (error) {
      Alert.alert("Could not send request", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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

          <View style={styles.bookingBox}>
            <Text style={styles.boxTitle}>Request booking</Text>
            <Text style={styles.boxBody}>Send your details to the live ApnaRooms backend. The team can confirm availability and token payment.</Text>
            <TextInput
              value={form.name}
              onChangeText={(name) => setForm((current) => ({ ...current, name }))}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TextInput
              value={form.phone}
              onChangeText={(phone) => setForm((current) => ({ ...current, phone }))}
              placeholder="+91 phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              value={form.email}
              onChangeText={(email) => setForm((current) => ({ ...current, email }))}
              placeholder="Email optional"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={form.message}
              onChangeText={(message) => setForm((current) => ({ ...current, message }))}
              placeholder="Move-in date or note optional"
              placeholderTextColor="#9CA3AF"
              multiline
              style={[styles.input, styles.noteInput]}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.action, styles.whatsapp]} onPress={() => openWhatsAppBooking(property)}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.actionText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={submitBookingRequest} disabled={!property.isAvailable || submitting}>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.actionText}>{submitting ? "Sending..." : property.isAvailable ? "Send Request" : "Reserved"}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.paymentLink} onPress={() => openPropertyCheckout(property)} disabled={!property.isAvailable}>
            <Ionicons name="card" size={18} color={colors.primary} />
            <Text style={styles.paymentText}>Open secure token payment</Text>
          </TouchableOpacity>
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
  bookingBox: {
    gap: 10,
    marginTop: 22,
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface
  },
  boxTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  boxBody: {
    color: colors.muted,
    lineHeight: 21
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 15,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    color: colors.ink,
    fontWeight: "700"
  },
  noteInput: {
    minHeight: 84,
    paddingTop: 14,
    textAlignVertical: "top"
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
  },
  paymentLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DAD7FF",
    borderRadius: 16,
    backgroundColor: colors.surface
  },
  paymentText: {
    color: colors.primary,
    fontWeight: "900"
  }
});
