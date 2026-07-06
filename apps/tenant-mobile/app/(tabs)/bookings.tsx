import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { listBookingRequests, type BookingRequest } from "@/services/bookingRequests";
import { colors, shadow } from "@/theme/colors";

export default function BookingsScreen() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      listBookingRequests().then((items) => {
        if (mounted) setRequests(items);
      });

      return () => {
        mounted = false;
      };
    }, [])
  );

  return (
    <AppScreen>
      <ScrollView style={styles.wrap} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Your bookings" eyebrow="Bookings" />
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Active requests</Text>
            <Text style={styles.summaryValue}>{requests.length}</Text>
          </View>
          <View style={styles.summaryIcon}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
          </View>
        </View>
        {requests.length ? (
          <View style={styles.list}>
            {requests.map((request) => (
              <View key={request.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.bookingIcon}>
                    <Ionicons name="home" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.title}>{request.propertyTitle}</Text>
                    <Text style={styles.meta}>{request.locality} | Token INR {request.tokenAmount.toLocaleString("en-IN")}</Text>
                  </View>
                </View>
                <View style={styles.timeline}>
                  <View style={styles.stepDone}><Ionicons name="checkmark" size={13} color="#fff" /></View>
                  <View style={styles.stepLine} />
                  <View style={styles.stepPending}><Ionicons name="call" size={13} color={colors.primary} /></View>
                  <View style={styles.stepLine} />
                  <View style={styles.stepPending}><Ionicons name="card" size={13} color={colors.primary} /></View>
                </View>
                <View style={styles.bookingFooter}>
                  <Text style={styles.status}>{request.status.replaceAll("_", " ")}</Text>
                  <Text style={styles.date}>{new Date(request.createdAt).toLocaleString("en-IN")}</Text>
                </View>
                <View style={styles.manageButton}>
                  <Ionicons name="chatbubble-ellipses" size={17} color={colors.primary} />
                  <Text style={styles.manageText}>Support will confirm availability</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="calendar"
            title="No booking requests"
            body="Open a live property and send a booking request. It will be saved here after the backend accepts it."
          />
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1
  },
  content: {
    padding: 20,
    gap: 16
  },
  list: {
    gap: 14
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  summaryLabel: {
    color: colors.muted,
    fontWeight: "800"
  },
  summaryValue: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900"
  },
  summaryIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: "#EEF2FF"
  },
  card: {
    borderWidth: 1,
    borderColor: "#ECEBFF",
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  cardTop: {
    flexDirection: "row",
    gap: 12
  },
  bookingIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#EEF2FF"
  },
  cardTitleBlock: {
    flex: 1
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  meta: {
    marginTop: 8,
    color: colors.muted,
    fontWeight: "700"
  },
  status: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#EEF2FF",
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  date: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16
  },
  stepDone: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.success
  },
  stepPending: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#EEF2FF"
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E6E8F5"
  },
  bookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#F7F7FF"
  },
  manageText: {
    flex: 1,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  }
});
