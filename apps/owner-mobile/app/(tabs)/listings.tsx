import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AuthPanel } from "@/components/AuthPanel";
import { EmptyState } from "@/components/EmptyState";
import { OwnerListingCard } from "@/components/OwnerListingCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { colors } from "@/theme/colors";

export default function OwnerListingsScreen() {
  const { user, token, loading, authError, login, register } = useAuth();
  const { properties, loading: loadingProperties, error, refresh, toggleAvailability } = useOwnerProperties(token);

  if (loading) return <AppScreen><View style={styles.center}><ActivityIndicator color={colors.primary} /></View></AppScreen>;

  if (!user || !token) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.authWrap}>
          <AuthPanel loading={loading} error={authError} onLogin={login} onRegister={register} />
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView
        style={styles.wrap}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loadingProperties} onRefresh={refresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Your properties" eyebrow="Listings" />
        {loadingProperties ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
        ) : properties.length ? (
          properties.map((property) => (
            <OwnerListingCard key={property.id} property={property} onToggleAvailability={() => toggleAvailability(property)} />
          ))
        ) : (
          <EmptyState title="No owner listings" body={error || "Add your first property and track approval here."} icon="business" />
        )}
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
  authWrap: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  wrap: {
    flex: 1
  },
  content: {
    padding: 20,
    gap: 16
  },
  loader: {
    marginVertical: 40
  }
});
