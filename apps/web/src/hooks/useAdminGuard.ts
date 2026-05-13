"use client";

import { useAuth } from "./useAuth";

export function useAdminGuard() {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    // Replace with backend role lookup from `/api/users/me`.
    isAdmin: Boolean(user)
  };
}
