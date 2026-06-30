import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { BackendProperty, PropertyCategory } from "@/types/api";

type PropertiesResponse = {
  properties: BackendProperty[];
};

export function useProperties() {
  const [properties, setProperties] = useState<BackendProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<PropertyCategory>("all");
  const [query, setQuery] = useState("");
  const [locality, setLocality] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch<PropertiesResponse>("/properties?limit=100");
      setProperties(result.properties);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return properties.filter((property) => {
      const categoryMatch = category === "all" || property.category === category;
      const localityMatch = !locality || property.locality === locality;
      const queryMatch =
        !normalized ||
        property.title.toLowerCase().includes(normalized) ||
        property.locality.toLowerCase().includes(normalized) ||
        property.address?.toLowerCase().includes(normalized) ||
        property.amenities.some((item) => item.toLowerCase().includes(normalized));

      return categoryMatch && localityMatch && queryMatch;
    });
  }, [category, locality, properties, query]);

  const localities = useMemo(
    () => Array.from(new Set(properties.map((property) => property.locality))).sort(),
    [properties]
  );

  return {
    properties,
    filtered,
    localities,
    loading,
    error,
    refresh: load,
    category,
    setCategory,
    query,
    setQuery,
    locality,
    setLocality
  };
}
