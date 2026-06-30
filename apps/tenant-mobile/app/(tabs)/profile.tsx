import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { SectionHeader } from "@/components/SectionHeader";
import { env } from "@/config/env";
import { colors, shadow } from "@/theme/colors";

export default function ProfileScreen() {
  return (
    <AppScreen>
      <View style={styles.content}>
        <SectionHeader title="Profile" eyebrow="Account" />
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color={colors.primary} />
          </View>
          <Text style={styles.title}>Login will connect Firebase Auth</Text>
          <Text style={styles.body}>Google login and phone OTP should be wired here after Firebase mobile credentials are added.</Text>
        </View>
        <TouchableOpacity style={[styles.action, styles.secondary]} onPress={() => WebBrowser.openBrowserAsync(`${env.webUrl}/login`)}>
          <Ionicons name="log-in" size={20} color={colors.primary} />
          <Text style={[styles.actionText, styles.secondaryText]}>Open web login</Text>
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
    gap: 16
  },
  card: {
    alignItems: "center",
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  avatar: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 39,
    backgroundColor: "#EEF2FF"
  },
  title: {
    marginTop: 18,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  body: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 21,
    textAlign: "center"
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
