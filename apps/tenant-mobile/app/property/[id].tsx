import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { useProperties } from "@/hooks/useProperties";
import { createBookingRequest } from "@/services/bookingRequests";
import { openPropertyCheckout, openWhatsAppBooking } from "@/services/payments";
import { createReview, listReviews } from "@/services/reviews";
import { colors } from "@/theme/colors";
import type { BackendReview } from "@/types/api";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties, loading } = useProperties();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: "", phone: "", email: "", rating: 5, body: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const property = properties.find((item) => item.id === id);

  useEffect(() => {
    if (!id) return;
    listReviews(id)
      .then((result) => setReviews(result.reviews))
      .catch(() => setReviews([]));
  }, [id]);

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

  async function submitReview() {
    if (!property) return;

    if (!reviewForm.name.trim() || !reviewForm.body.trim()) {
      Alert.alert("Review needed", "Add your name and actual experience before submitting.");
      return;
    }

    setReviewSubmitting(true);
    try {
      await createReview({
        propertyId: property.id,
        name: reviewForm.name.trim(),
        phone: reviewForm.phone.trim() || undefined,
        email: reviewForm.email.trim() || undefined,
        rating: reviewForm.rating,
        body: reviewForm.body.trim()
      });
      setReviewForm({ name: "", phone: "", email: "", rating: 5, body: "" });
      Alert.alert("Review submitted", "Thank you. Your review will appear after admin approval.");
    } catch (error) {
      Alert.alert("Could not submit review", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setReviewSubmitting(false);
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
            <Text style={styles.boxBody}>Share your contact and move-in plan. ApnaRooms will call the owner, confirm availability, and guide the token payment.</Text>
            <View style={styles.bookingSteps}>
              <View style={styles.bookingStep}><Ionicons name="person" size={16} color={colors.primary} /><Text style={styles.bookingStepText}>Details</Text></View>
              <View style={styles.bookingStep}><Ionicons name="call" size={16} color={colors.primary} /><Text style={styles.bookingStepText}>Owner call</Text></View>
              <View style={styles.bookingStep}><Ionicons name="card" size={16} color={colors.primary} /><Text style={styles.bookingStepText}>Token</Text></View>
            </View>
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

          <View style={styles.reviewBox}>
            <Text style={styles.boxTitle}>Customer reviews</Text>
            {reviews.length ? reviews.map((review) => (
              <View style={styles.reviewItem} key={review.id}>
                <View style={styles.reviewHead}>
                  <View style={styles.reviewAvatar}><Text style={styles.reviewInitial}>{review.name.slice(0, 1).toUpperCase()}</Text></View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewRating}>{review.rating.toFixed(1)} rating</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.body}</Text>
              </View>
            )) : (
              <Text style={styles.reviewText}>Approved reviews for this property will appear here.</Text>
            )}
            <View style={styles.reviewForm}>
              <Text style={styles.boxTitle}>Share your experience</Text>
              <TextInput
                value={reviewForm.name}
                onChangeText={(name) => setReviewForm((current) => ({ ...current, name }))}
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
              <TextInput
                value={reviewForm.phone}
                onChangeText={(phone) => setReviewForm((current) => ({ ...current, phone }))}
                placeholder="+91 phone optional"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                style={styles.input}
              />
              <TextInput
                value={reviewForm.email}
                onChangeText={(email) => setReviewForm((current) => ({ ...current, email }))}
                placeholder="Email optional"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.ratingButton, reviewForm.rating === rating && styles.ratingButtonActive]}
                    onPress={() => setReviewForm((current) => ({ ...current, rating }))}
                  >
                    <Ionicons name="star" size={15} color={reviewForm.rating >= rating ? colors.accent : colors.muted} />
                    <Text style={[styles.ratingButtonText, reviewForm.rating === rating && styles.ratingButtonTextActive]}>{rating}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={reviewForm.body}
                onChangeText={(body) => setReviewForm((current) => ({ ...current, body }))}
                placeholder="Write your actual visit, stay, booking, or support experience"
                placeholderTextColor="#9CA3AF"
                multiline
                style={[styles.input, styles.noteInput]}
              />
              <TouchableOpacity style={styles.reviewSubmitButton} onPress={submitReview} disabled={reviewSubmitting}>
                <Ionicons name="star" size={18} color="#fff" />
                <Text style={styles.actionText}>{reviewSubmitting ? "Submitting..." : "Submit Review"}</Text>
              </TouchableOpacity>
            </View>
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
  bookingSteps: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4
  },
  bookingStep: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    borderRadius: 14,
    paddingVertical: 10,
    backgroundColor: "#F7F7FF"
  },
  bookingStepText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900"
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
  },
  reviewBox: {
    gap: 12,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#ECEBFF",
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface
  },
  reviewItem: {
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEBFF",
    paddingBottom: 12
  },
  reviewHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  reviewAvatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#EEF2FF"
  },
  reviewInitial: {
    color: colors.primary,
    fontWeight: "900"
  },
  reviewMeta: {
    flex: 1
  },
  reviewName: {
    color: colors.ink,
    fontWeight: "900"
  },
  reviewRating: {
    marginTop: 3,
    color: colors.warning,
    fontSize: 12,
    fontWeight: "800"
  },
  reviewText: {
    color: colors.text,
    lineHeight: 21,
    fontWeight: "600"
  },
  reviewForm: {
    gap: 10,
    marginTop: 4
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8
  },
  ratingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: "#fff"
  },
  ratingButtonActive: {
    borderColor: colors.accent,
    backgroundColor: "#FFF7E8"
  },
  ratingButtonText: {
    color: colors.muted,
    fontWeight: "900"
  },
  ratingButtonTextActive: {
    color: colors.ink
  },
  reviewSubmitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: colors.primary
  }
});
