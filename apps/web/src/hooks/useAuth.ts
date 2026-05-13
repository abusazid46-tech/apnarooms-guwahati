"use client";

import type { User } from "firebase/auth";
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
    let active = true;

    async function subscribe() {
      try {
        const [{ onAuthStateChanged }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
        if (!active) return;

        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
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
        if (active) setLoading(false);
      }
    }

    subscribe();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { user, profile, loading, isAdmin: Boolean(profile && ["ADMIN", "SALES", "SUPPORT"].includes(profile.role)) };
}
