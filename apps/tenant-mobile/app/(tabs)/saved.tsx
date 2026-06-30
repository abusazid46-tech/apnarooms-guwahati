import { StyleSheet, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";

export default function SavedScreen() {
  return (
    <AppScreen>
      <View style={styles.content}>
        <SectionHeader title="Saved stays" eyebrow="Wishlist" />
        <EmptyState
          icon="heart"
          title="No saved stays yet"
          body="Save PGs, rooms, flats and homestays here while comparing options."
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
