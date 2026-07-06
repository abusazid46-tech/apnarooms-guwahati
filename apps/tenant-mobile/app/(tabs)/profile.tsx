import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { SectionHeader } from "@/components/SectionHeader";
import { env } from "@/config/env";
import { colors, shadow } from "@/theme/colors";

const accountItems = [
  { icon: "shield-checkmark" as const, label: "Phone verification", value: "Required for booking calls" },
  { icon: "document-text" as const, label: "Tenant documents", value: "Keep ID proof ready for owner visit" },
  { icon: "heart" as const, label: "Saved preferences", value: "PG, rooms, flats and hostel searches" }
];

const supportItems = [
  "Booking confirmation call",
  "Owner visit coordination",
  "Payment and refund help"
];

export default function ProfileScreen() {
  return (
    <AppScreen>
      <ScrollView style={styles.wrap} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Profile" eyebrow="Account" />
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={34} color={colors.primary} />
            </View>
            <View style={styles.verifiedPill}>
              <Ionicons name="sparkles" size={15} color={colors.success} />
              <Text style={styles.verifiedText}>Tenant profile</Text>
            </View>
          </View>
          <Text style={styles.title}>ApnaRooms tenant account</Text>
          <Text style={styles.body}>Login once to manage booking requests, owner calls, token payments, visit notes, and support follow-ups.</Text>
          <View style={styles.profileStats}>
            <View><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Active bookings</Text></View>
            <View><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>Saved filters</Text></View>
            <View><Text style={styles.statValue}>24/7</Text><Text style={styles.statLabel}>Support</Text></View>
          </View>
        </View>

        <View style={styles.accountList}>
          {accountItems.map((item) => (
            <View style={styles.infoRow} key={item.label}>
              <View style={styles.infoIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.infoCopy}>
                <Text style={styles.infoTitle}>{item.label}</Text>
                <Text style={styles.infoBody}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>What ApnaRooms support helps with</Text>
          {supportItems.map((item) => (
            <View style={styles.supportRow} key={item}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.supportText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.reviewStars}>
            {[0, 1, 2, 3, 4].map((item) => (
              <Ionicons key={item} name="star" size={15} color={colors.accent} />
            ))}
          </View>
          <Text style={styles.reviewText}>The team called back after I sent a request and helped me schedule a visit the same day.</Text>
          <Text style={styles.reviewName}>Ritupan, Ganeshguri</Text>
        </View>

        <TouchableOpacity style={[styles.action, styles.secondary]} onPress={() => WebBrowser.openBrowserAsync(`${env.webUrl}/login`)}>
          <Ionicons name="log-in" size={20} color={colors.primary} />
          <Text style={[styles.actionText, styles.secondaryText]}>Login securely</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => WebBrowser.openBrowserAsync(`${env.webUrl}/dashboard`)}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.actionText}>Open dashboard</Text>
        </TouchableOpacity>
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
  heroCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  avatar: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 39,
    backgroundColor: "#EEF2FF"
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#EAF8F2"
  },
  verifiedText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900"
  },
  title: {
    marginTop: 18,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "left"
  },
  body: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 21,
    textAlign: "left"
  },
  profileStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  statValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  statLabel: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  accountList: {
    gap: 10
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.surface
  },
  infoIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#EEF2FF"
  },
  infoCopy: {
    flex: 1
  },
  infoTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  infoBody: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  supportCard: {
    gap: 10,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#F7F7FF"
  },
  supportTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  supportText: {
    color: colors.text,
    fontWeight: "700"
  },
  reviewCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: "#ECEBFF",
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface
  },
  reviewStars: {
    flexDirection: "row",
    gap: 3
  },
  reviewText: {
    color: colors.text,
    lineHeight: 21,
    fontWeight: "600"
  },
  reviewName: {
    color: colors.primary,
    fontWeight: "900"
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: colors.primary
  },
  secondary: {
    borderWidth: 1,
    borderColor: "#DAD7FF",
    backgroundColor: colors.surface
  },
  actionText: {
    color: "#fff",
    fontWeight: "900"
  },
  secondaryText: {
    color: colors.primary
  }
});
