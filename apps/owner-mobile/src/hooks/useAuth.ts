import { useCallback, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { apiPost } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";
import type { BackendUser } from "@/types/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BackendUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const syncProfile = useCallback(async (nextUser: User) => {
    const idToken = await nextUser.getIdToken();
    setToken(idToken);
    const result = await apiPost<{ user: BackendUser }>("/auth/sync-user", {}, { token: idToken });
    setProfile(result.user);
    return idToken;
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        if (!active) return;
        setUser(nextUser);
        if (!nextUser) {
          setToken(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        syncProfile(nextUser)
          .catch((error) => setAuthError(error instanceof Error ? error.message : "Unable to sync account."))
          .finally(() => setLoading(false));
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to start Firebase auth.");
      setLoading(false);
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [syncProfile]);

  async function login(email: string, password: string) {
    setAuthError("");
    const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    const idToken = await syncProfile(credential.user);
    await apiPost("/users/me/become-landlord", {}, { token: idToken });
    return idToken;
  }

  async function register(email: string, password: string) {
    setAuthError("");
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    const idToken = await syncProfile(credential.user);
    await apiPost("/users/me/become-landlord", {}, { token: idToken });
    return idToken;
  }

  async function becomeOwner() {
    if (!token) return;
    const result = await apiPost<{ user: BackendUser }>("/users/me/become-landlord", {}, { token });
    setProfile(result.user);
  }

  async function logout() {
    await signOut(getFirebaseAuth());
    setUser(null);
    setProfile(null);
    setToken(null);
  }

  return { user, profile, token, loading, authError, login, register, becomeOwner, logout };
}
