import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AuthPanel } from "@/components/AuthPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { env } from "@/config/env";
import { useAuth } from "@/hooks/useAuth";
import { colors, shadow } from "@/theme/colors";

export default function OwnerProfileScreen() {
  const { user, profile, token, loading, authError, login, register, becomeOwner, logout } = useAuth();

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
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Owner profile" eyebrow="Account" />
        <View style={styles.card}>
          <Text style={styles.name}>{profile?.name || user.email || "Property owner"}</Text>
          <Text style={styles.meta}>{profile?.email || user.email}</Text>
          <Text style={styles.role}>Role: {profile?.role ?? "USER"}</Text>
          {profile?.role !== "LANDLORD" && profile?.role !== "ADMIN" ? (
            <TouchableOpacity style={styles.primary} onPress={becomeOwner}>
              <Text style={styles.primaryText}>Activate owner access</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.secondary} onPress={() => WebBrowser.openBrowserAsync(`${env.webUrl}/dashboard?owner=1`)}>
            <Text style={styles.secondaryText}>Open web owner dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
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
  authWrap: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  content: {
    padding: 20
  },
  card: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  name: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  meta: {
    marginTop: 8,
    color: colors.muted,
    fontWeight: "800"
  },
  role: {
    marginTop: 12,
    color: colors.primary,
    fontWeight: "900"
  },
  primary: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: colors.primary
  },
  primaryText: {
    color: "#fff",
    fontWeight: "900"
  },
  secondary: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#EEF2FF"
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: "900"
  },
  logout: {
    alignItems: "center",
    paddingTop: 18
  },
  logoutText: {
    color: colors.brandRed,
    fontWeight: "900"
  }
});
