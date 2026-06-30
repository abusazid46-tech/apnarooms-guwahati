import { useCallback, useEffect, useMemo, useState } from "react";
import { listOwnerProperties, updateOwnerAvailability } from "@/services/ownerProperties";
import type { BackendProperty } from "@/types/api";

export function useOwnerProperties(token?: string | null) {
  const [properties, setProperties] = useState<BackendProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await listOwnerProperties(token);
      setProperties(result.properties);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load owner listings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const stats = useMemo(() => ({
    total: properties.length,
    live: properties.filter((property) => property.status === "PUBLISHED").length,
    available: properties.filter((property) => property.isAvailable).length,
    review: properties.filter((property) => property.status !== "PUBLISHED").length
  }), [properties]);

  async function toggleAvailability(property: BackendProperty) {
    if (!token) return;
    const nextValue = !property.isAvailable;
    setProperties((current) => current.map((item) => (
      item.id === property.id ? { ...item, isAvailable: nextValue } : item
    )));
    try {
      await updateOwnerAvailability(token, property.id, nextValue);
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update availability.");
      await refresh();
    }
  }

  return { properties, stats, loading, error, refresh, toggleAvailability };
}
