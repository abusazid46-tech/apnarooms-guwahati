import { router } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { PropertyCard } from "@/components/PropertyCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useProperties } from "@/hooks/useProperties";
import { openWhatsAppBooking } from "@/services/payments";
import { colors } from "@/theme/colors";

export default function ExploreScreen() {
  const { filtered, loading, query, setQuery, error } = useProperties();

  return (
    <AppScreen>
      <ScrollView style={styles.wrap} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Explore ApnaRooms" eyebrow="Search" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search PG, rooms, flats, locality"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
        ) : filtered.length ? (
          <View style={styles.list}>
            {filtered.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => router.push({ pathname: "/property/[id]", params: { id: property.id } })}
                onWhatsApp={() => openWhatsAppBooking(property)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No matching stays" body={error || "Try a different locality, category or keyword."} icon="search" />
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
    gap: 18
  },
  input: {
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  list: {
    gap: 18
  },
  loader: {
    marginTop: 60
  }
});
