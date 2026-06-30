import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AuthPanel } from "@/components/AuthPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { createOwnerProperty } from "@/services/ownerProperties";
import { colors, shadow } from "@/theme/colors";
import type { BackendProperty } from "@/types/api";

const categories: BackendProperty["category"][] = ["PG", "HOMESTAY", "FLAT", "ROOM"];

const initialForm = {
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  title: "",
  description: "",
  category: "PG" as BackendProperty["category"],
  rentMonthly: "",
  depositAmount: "",
  tokenAmount: "750",
  locality: "",
  city: "Guwahati",
  address: "",
  amenities: "",
  imageUrls: ""
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AddOwnerListingScreen() {
  const { user, profile, token, loading, authError, login, register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  async function submit() {
    if (!token) return;
    const ownerName = optionalText(form.ownerName) || profile?.name || user?.displayName || "";
    const ownerPhone = optionalText(form.ownerPhone) || profile?.phone || "";
    const ownerEmail = optionalText(form.ownerEmail) || profile?.email || user?.email || "";
    const title = form.title.trim();
    const locality = form.locality.trim();
    const city = form.city.trim();
    const rentMonthly = Number(form.rentMonthly);
    const tokenAmount = Number(form.tokenAmount);

    if (!ownerName || !ownerPhone || !ownerEmail || title.length < 3 || !locality || !city || !rentMonthly || !tokenAmount) {
      setMessage("Fill owner contact, title, rent, token, locality and city.");
      return;
    }

    setSaving(true);
    setMessage("Submitting listing for admin approval...");
    try {
      const images = form.imageUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean)
        .filter(isHttpUrl)
        .map((url, index) => ({ url, alt: title, sortOrder: index }));

      await createOwnerProperty(token, {
        ownerName,
        ownerPhone,
        ownerEmail,
        title,
        description: optionalText(form.description),
        category: form.category,
        rentMonthly,
        depositAmount: form.depositAmount ? Number(form.depositAmount) : undefined,
        tokenAmount,
        locality,
        city,
        address: optionalText(form.address),
        amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        images,
        isAvailable: true
      });
      setForm({ ...initialForm, ownerName, ownerPhone, ownerEmail });
      setMessage("Listing submitted. Admin approval is required before it appears publicly.");
      router.push("/listings");
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : "Unable to submit listing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppScreen>
      <ScrollView style={styles.wrap} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Add property" eyebrow="Owner" />
        <View style={styles.form}>
          <Input value={form.ownerName} onChangeText={(ownerName) => setForm({ ...form, ownerName })} placeholder="Owner name" />
          <Input value={form.ownerPhone} onChangeText={(ownerPhone) => setForm({ ...form, ownerPhone })} placeholder="Contact number" keyboardType="phone-pad" />
          <Input value={form.ownerEmail} onChangeText={(ownerEmail) => setForm({ ...form, ownerEmail })} placeholder="Email ID" keyboardType="email-address" />
          <Input value={form.title} onChangeText={(title) => setForm({ ...form, title })} placeholder="Property title" />
          <TextInput value={form.description} onChangeText={(description) => setForm({ ...form, description })} placeholder="Short description" placeholderTextColor="#9CA3AF" multiline style={[styles.input, styles.textarea]} />
          <View style={styles.categoryRow}>
            {categories.map((category) => (
              <TouchableOpacity key={category} style={[styles.chip, form.category === category && styles.activeChip]} onPress={() => setForm({ ...form, category })}>
                <Text style={[styles.chipText, form.category === category && styles.activeChipText]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input value={form.rentMonthly} onChangeText={(rentMonthly) => setForm({ ...form, rentMonthly })} placeholder={form.category === "HOMESTAY" ? "Daily rate" : "Monthly rent"} keyboardType="numeric" />
          <Input value={form.depositAmount} onChangeText={(depositAmount) => setForm({ ...form, depositAmount })} placeholder="Deposit amount" keyboardType="numeric" />
          <Input value={form.tokenAmount} onChangeText={(tokenAmount) => setForm({ ...form, tokenAmount })} placeholder="Token amount" keyboardType="numeric" />
          <Input value={form.locality} onChangeText={(locality) => setForm({ ...form, locality })} placeholder="Locality" />
          <Input value={form.city} onChangeText={(city) => setForm({ ...form, city })} placeholder="City" />
          <Input value={form.address} onChangeText={(address) => setForm({ ...form, address })} placeholder="Full address" />
          <Input value={form.amenities} onChangeText={(amenities) => setForm({ ...form, amenities })} placeholder="Amenities comma separated" />
          <TextInput value={form.imageUrls} onChangeText={(imageUrls) => setForm({ ...form, imageUrls })} placeholder="Image URLs, one per line" placeholderTextColor="#9CA3AF" multiline style={[styles.input, styles.textarea]} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TouchableOpacity style={styles.submit} onPress={submit} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit for approval</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

type InputProps = {
  value: string;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  onChangeText: (value: string) => void;
};

function Input({ value, placeholder, keyboardType = "default", onChangeText }: InputProps) {
  return (
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9CA3AF" keyboardType={keyboardType} style={styles.input} />
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
    padding: 20
  },
  form: {
    gap: 12,
    borderRadius: 26,
    padding: 16,
    backgroundColor: colors.surface,
    ...shadow.card
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "#F7F7FB",
    color: colors.ink,
    fontWeight: "800"
  },
  textarea: {
    minHeight: 96,
    paddingTop: 16,
    textAlignVertical: "top"
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#EEF2FF"
  },
  activeChip: {
    backgroundColor: colors.primary
  },
  chipText: {
    color: colors.primary,
    fontWeight: "900"
  },
  activeChipText: {
    color: "#fff"
  },
  message: {
    color: colors.brandRed,
    fontWeight: "800",
    lineHeight: 20
  },
  submit: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primary
  },
  submitText: {
    color: "#fff",
    fontWeight: "900"
  }
});
