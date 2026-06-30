import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AuthPanel } from "@/components/AuthPanel";
import { EmptyState } from "@/components/EmptyState";
import { OwnerListingCard } from "@/components/OwnerListingCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { colors, shadow } from "@/theme/colors";

export default function OwnerDashboardScreen() {
  const { user, profile, token, loading, authError, login, register, becomeOwner } = useAuth();
  const { properties, stats, loading: loadingProperties, error, refresh, toggleAvailability } = useOwnerProperties(token);

  if (loading) {
    return <AppScreen><View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View></AppScreen>;
  }

  if (!user || !token) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.authWrap}>
          <AuthPanel loading={loading} error={authError} onLogin={login} onRegister={register} />
        </ScrollView>
      </AppScreen>
    );
  }

  const latest = properties.slice(0, 3);

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loadingProperties} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
          <View style={styles.heroTop}>
            <Image source={require("../../assets/brand/apnarooms-logo.png")} style={styles.logo} contentFit="contain" />
            <TouchableOpacity style={styles.bell} activeOpacity={0.85}>
              <Ionicons name="notifications-outline" size={22} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
          <Text style={styles.welcome}>Owner dashboard</Text>
          <Text style={styles.subtitle}>{profile?.name || user.email || "Manage ApnaRooms listings"}</Text>
          {profile?.role !== "LANDLORD" && profile?.role !== "ADMIN" ? (
            <TouchableOpacity style={styles.ownerButton} onPress={becomeOwner}>
              <Text style={styles.ownerButtonText}>Activate owner access</Text>
            </TouchableOpacity>
          ) : null}
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <Stat title="Total" value={stats.total} icon="albums" />
            <Stat title="Live" value={stats.live} icon="checkmark-circle" />
            <Stat title="Available" value={stats.available} icon="flash" />
            <Stat title="Review" value={stats.review} icon="time" />
          </View>

          <TouchableOpacity style={styles.addCard} onPress={() => router.push("/add")} activeOpacity={0.9}>
            <View style={styles.addIcon}><Ionicons name="add" size={24} color="#fff" /></View>
            <View style={styles.addCopy}>
              <Text style={styles.addTitle}>List a property</Text>
              <Text style={styles.addText}>PG, room, flat or homestay draft for admin approval.</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </TouchableOpacity>

          <SectionHeader title="Recent listings" eyebrow="Inventory" onPress={() => router.push("/listings")} />
          {loadingProperties ? (
            <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
          ) : latest.length ? (
            <View style={styles.list}>
              {latest.map((property) => (
                <OwnerListingCard key={property.id} property={property} onToggleAvailability={() => toggleAvailability(property)} />
              ))}
            </View>
          ) : (
            <EmptyState title="No listings yet" body={error || "Create your first property listing for admin review."} icon="business" />
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function Stat({ title, value, icon }: { title: string; value: number; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  authWrap: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
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
  welcome: {
    marginTop: 28,
    color: "#fff",
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    fontWeight: "700"
  },
  ownerButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.accent
  },
  ownerButtonText: {
    color: colors.ink,
    fontWeight: "900"
  },
  content: {
    padding: 20,
    gap: 18
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  stat: {
    width: "47.8%",
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  statValue: {
    marginTop: 10,
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900"
  },
  statTitle: {
    marginTop: 3,
    color: colors.muted,
    fontWeight: "800"
  },
  addCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#FFF7E8",
    ...shadow.card
  },
  addIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.brandRed
  },
  addCopy: {
    flex: 1
  },
  addTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  addText: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  list: {
    gap: 16
  },
  loader: {
    marginVertical: 30
  }
});
