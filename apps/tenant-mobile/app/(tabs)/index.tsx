import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { CategoryGrid } from "@/components/CategoryGrid";
import { EmptyState } from "@/components/EmptyState";
import { PropertyCard } from "@/components/PropertyCard";
import { SectionHeader } from "@/components/SectionHeader";
import { defaultLocalities } from "@/data/categories";
import { useProperties } from "@/hooks/useProperties";
import { openWhatsAppBooking } from "@/services/payments";
import { colors, shadow } from "@/theme/colors";

const clientReviews = [
  {
    name: "Ankita",
    locality: "Six Mile",
    text: "Girls PG options were easy to compare. The photos and rent details matched when I visited.",
    rating: "5.0"
  },
  {
    name: "Ritupan",
    locality: "Ganeshguri",
    text: "Booked a room after one owner call. No brokerage and the team followed up on move-in day.",
    rating: "4.8"
  },
  {
    name: "Nayan",
    locality: "Beltola",
    text: "Good support for hostel search. The app made shortlisting much faster for my family.",
    rating: "4.7"
  }
];

export default function HomeScreen() {
  const {
    filtered,
    localities,
    loading,
    error,
    refresh,
    query,
    setQuery,
    setCategory,
    setLocality
  } = useProperties();

  const popularLocalities = (localities.length ? localities : defaultLocalities).slice(0, 6);
  const featured = filtered.find((item) => item.images?.[0]) ?? filtered[0];

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
          <View style={styles.heroTop}>
            <Image source={require("../../assets/brand/apnarooms-logo.png")} style={styles.logo} contentFit="contain" />
            <TouchableOpacity style={styles.bell} activeOpacity={0.85}>
              <Ionicons name="notifications-outline" size={22} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
          <View style={styles.welcomeRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.welcome}>Welcome</Text>
              <Text style={styles.name}>Find your next stay</Text>
            </View>
          </View>
          <View style={styles.searchBox}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search locality, PG, room..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
            <Ionicons name="search" size={24} color={colors.muted} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <SectionHeader title="Choose your stay type" eyebrow="Category" onPress={() => {
            setCategory("all");
            setQuery("");
          }} />
          <CategoryGrid
            onSelect={(item) => {
              setCategory(item.category);
              setQuery("");
              setLocality("");
            }}
          />

          <SectionHeader title="Popular localities" eyebrow="Explore" icon="navigate" />
          <FlatList
            horizontal
            data={popularLocalities}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.localityList}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={[styles.localityCard, index % 2 === 1 && styles.localityAlt]} onPress={() => setLocality(item)} activeOpacity={0.88}>
                <Text style={styles.localityTitle}>{item}</Text>
                <Text style={styles.localityMeta}>{index < 3 ? "Popular" : "Nearby"}</Text>
              </TouchableOpacity>
            )}
          />

          {featured ? (
            <>
              <SectionHeader title="Recommended" eyebrow="Live properties" />
              <View style={styles.cardGap}>
                {filtered.slice(0, 8).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onPress={() => router.push({ pathname: "/property/[id]", params: { id: property.id } })}
                    onWhatsApp={() => openWhatsAppBooking(property)}
                  />
                ))}
              </View>
            </>
          ) : loading ? (
            <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
          ) : (
            <EmptyState title="No live properties" body={error || "Add approved properties from admin to show them in the app."} />
          )}

          <SectionHeader title="Client reviews" eyebrow="Trusted by tenants" icon="star" />
          <FlatList
            horizontal
            data={clientReviews}
            keyExtractor={(item) => item.name}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewList}
            renderItem={({ item }) => (
              <View style={styles.reviewCard}>
                <View style={styles.reviewHead}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewInitial}>{item.name.slice(0, 1)}</Text>
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewName}>{item.name}</Text>
                    <Text style={styles.reviewLocality}>{item.locality}</Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Ionicons name="star" size={13} color={colors.accent} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>{item.text}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 30,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  logo: {
    width: 150,
    height: 42
  },
  bell: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#fff"
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 22
  },
  avatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    backgroundColor: "#fff"
  },
  welcome: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900"
  },
  name: {
    marginTop: 2,
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    fontWeight: "700"
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "#fff"
  },
  searchInput: {
    flex: 1,
    height: 56,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700"
  },
  content: {
    padding: 20,
    gap: 10
  },
  localityList: {
    gap: 14,
    paddingRight: 20
  },
  localityCard: {
    width: 148,
    height: 118,
    justifyContent: "flex-end",
    borderRadius: 24,
    padding: 15,
    backgroundColor: colors.primary,
    ...shadow.card
  },
  localityAlt: {
    backgroundColor: colors.brandRed
  },
  localityTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900"
  },
  localityMeta: {
    marginTop: 6,
    color: "rgba(255,255,255,0.82)",
    fontWeight: "800"
  },
  cardGap: {
    gap: 18
  },
  reviewList: {
    gap: 14,
    paddingRight: 20
  },
  reviewCard: {
    width: 285,
    borderWidth: 1,
    borderColor: "#ECEBFF",
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
    ...shadow.card
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
  reviewLocality: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#FFF7E8"
  },
  ratingText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  reviewText: {
    marginTop: 14,
    color: colors.text,
    lineHeight: 21,
    fontWeight: "600"
  },
  loader: {
    marginVertical: 40
  }
});
