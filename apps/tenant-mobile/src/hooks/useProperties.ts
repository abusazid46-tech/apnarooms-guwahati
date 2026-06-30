import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { BackendProperty, PropertyCategory } from "@/types/api";

type PropertiesResponse = {
  properties: BackendProperty[];
};

function toNumber(value: unknown, fallback = 0) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeProperty(property: Partial<BackendProperty>): BackendProperty {
  return {
    id: String(property.id ?? ""),
    title: property.title ?? "Untitled property",
    slug: property.slug ?? null,
    description: property.description ?? null,
    category: property.category ?? "ROOM",
    status: property.status ?? "PUBLISHED",
    rentMonthly: toNumber(property.rentMonthly),
    depositAmount: property.depositAmount == null ? null : toNumber(property.depositAmount),
    tokenAmount: toNumber(property.tokenAmount),
    locality: property.locality ?? "Guwahati",
    city: property.city ?? "Guwahati",
    address: property.address ?? null,
    isVerified: Boolean(property.isVerified),
    isAvailable: property.isAvailable !== false,
    amenities: Array.isArray(property.amenities) ? property.amenities.filter(Boolean).map(String) : [],
    images: Array.isArray(property.images)
      ? property.images
          .filter((image) => image && typeof image.url === "string" && image.url.length > 0)
          .map((image, index) => ({
            id: String(image.id ?? `${property.id ?? "image"}-${index}`),
            url: image.url,
            path: image.path ?? null,
            alt: image.alt ?? null,
            sortOrder: toNumber(image.sortOrder, index)
          }))
      : [],
    createdAt: property.createdAt ?? new Date(0).toISOString()
  };
}

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
      const safeProperties = Array.isArray(result.properties) ? result.properties.map(normalizeProperty).filter((property) => property.id) : [];
      setProperties(safeProperties);
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
