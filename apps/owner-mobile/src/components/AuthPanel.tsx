import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors, shadow } from "@/theme/colors";

type AuthPanelProps = {
  loading?: boolean;
  error?: string;
  onLogin: (email: string, password: string) => Promise<unknown>;
  onRegister: (email: string, password: string) => Promise<unknown>;
};

export function AuthPanel({ loading, error, onLogin, onRegister }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!email.trim() || password.length < 6) {
      setMessage("Enter email and minimum 6 character password.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="key" size={28} color="#fff" />
      </View>
      <Text style={styles.title}>Owner account</Text>
      <Text style={styles.body}>Login or register with the same email-password Firebase account used by ApnaRooms.</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Owner email" placeholderTextColor="#9CA3AF" style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor="#9CA3AF" style={styles.input} />
      {message || error ? <Text style={styles.error}>{message || error}</Text> : null}
      <TouchableOpacity style={styles.primary} onPress={submit} disabled={submitting || loading}>
        {submitting || loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{mode === "login" ? "Login as owner" : "Create owner account"}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.switchButton} onPress={() => setMode(mode === "login" ? "register" : "login")}>
        <Text style={styles.switchText}>{mode === "login" ? "New owner? Register" : "Already registered? Login"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  icon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.primary
  },
  title: {
    marginTop: 16,
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  body: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 21
  },
  input: {
    minHeight: 54,
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "#F7F7FB",
    color: colors.ink,
    fontWeight: "800"
  },
  error: {
    marginTop: 12,
    color: colors.brandRed,
    fontWeight: "800"
  },
  primary: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: colors.primary
  },
  primaryText: {
    color: "#fff",
    fontWeight: "900"
  },
  switchButton: {
    alignItems: "center",
    paddingTop: 16
  },
  switchText: {
    color: colors.primary,
    fontWeight: "900"
  }
});
