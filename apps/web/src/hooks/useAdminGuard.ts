"use client";

import { useAuth } from "./useAuth";

export function useAdminGuard() {
  const { user, profile, loading, isAdmin } = useAuth();

  return {
    user,
    profile,
    loading,
    isAdmin
  };
}
