"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { apiPost } from "@/lib/api";
import type { BackendUser } from "@/types/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      apiPost<{ user: BackendUser }>("/auth/sync-user", {}, { user: nextUser })
        .then((result) => setProfile(result.user))
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
      });
    } catch {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  return { user, profile, loading, isAdmin: Boolean(profile && ["ADMIN", "SALES", "SUPPORT"].includes(profile.role)) };
}
