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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;

    async function subscribe() {
      try {
        const [{ onAuthStateChanged }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
        if (!active) return;

        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          setLoading(true);
          setAuthError(null);

          if (!nextUser) {
            setProfile(null);
            setLoading(false);
            return;
          }

          apiPost<{ user: BackendUser }>("/auth/sync-user", {}, { user: nextUser })
            .then((result) => {
              if (active) setProfile(result.user);
            })
            .catch((error) => {
              if (!active) return;
              setProfile(null);
              setAuthError(error instanceof Error ? error.message : "Could not sync account role");
            })
            .finally(() => {
              if (active) setLoading(false);
            });
        });
      } catch (error) {
        if (active) {
          setAuthError(error instanceof Error ? error.message : "Could not initialize login");
          setLoading(false);
        }
      }
    }

    subscribe();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    authError,
    isAdmin: Boolean(profile && ["ADMIN", "SALES", "SUPPORT"].includes(profile.role))
  };
}
