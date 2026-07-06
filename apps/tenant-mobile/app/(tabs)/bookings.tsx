import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { listBookingRequests, type BookingRequest } from "@/services/bookingRequests";
import { colors } from "@/theme/colors";

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
        {requests.length ? (
          <View style={styles.list}>
            {requests.map((request) => (
              <View key={request.id} style={styles.card}>
                <Text style={styles.title}>{request.propertyTitle}</Text>
                <Text style={styles.meta}>{request.locality} | Token INR {request.tokenAmount.toLocaleString("en-IN")}</Text>
                <Text style={styles.status}>{request.status.replaceAll("_", " ")}</Text>
                <Text style={styles.date}>{new Date(request.createdAt).toLocaleString("en-IN")}</Text>
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
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.surface
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
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#EEF2FF",
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  date: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  }
});
