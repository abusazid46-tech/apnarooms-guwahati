import * as SecureStore from "expo-secure-store";

const tokenKey = "apnarooms.firebaseToken";

export async function saveAuthToken(token: string) {
  await SecureStore.setItemAsync(tokenKey, token);
}

export async function getAuthToken() {
  return SecureStore.getItemAsync(tokenKey);
}

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync(tokenKey);
}
