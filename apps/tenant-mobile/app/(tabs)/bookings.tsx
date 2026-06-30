import { StyleSheet, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";

export default function BookingsScreen() {
  return (
    <AppScreen>
      <View style={styles.content}>
        <SectionHeader title="Your bookings" eyebrow="Bookings" />
        <EmptyState
          icon="calendar"
          title="No bookings yet"
          body="After login and token payment, confirmed bookings will appear here."
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20
  }
});
