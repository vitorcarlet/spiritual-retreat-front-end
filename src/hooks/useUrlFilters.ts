"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface UseUrlFiltersOptions<T> {
  defaultFilters: T;
  excludeFromCount?: (keyof T)[];
}

export function useUrlFilters<T extends Partial<Record<keyof T, unknown>>>({
  defaultFilters,
  excludeFromCount = [],
}: UseUrlFiltersOptions<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Keep a stable reference of defaultFilters to avoid reruns from new object identities
  const defaultRef = useRef<T>(defaultFilters);

  // Simple deep equality to avoid redundant updates
  const areFiltersEqual = useCallback((a: T, b: T) => {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }, []);

  // Parse URL params to filters based on the initial defaults
  const parseUrlParamsToFilters = useCallback((sp: URLSearchParams): T => {
    const tmp: Record<string, unknown> = { ...defaultRef.current } as Record<
      string,
      unknown
    >;

    sp.forEach((value, key) => {
      // Aceita qualquer chave (mesmo não estando no default)
      if (value.includes(",")) {
        tmp[key] = value.split(",");
      } else if (value.includes("&")) {
        // Suporta ranges no formato YYYY-MM-DD&YYYY-MM-DD
        tmp[key] = value; // ou value.split("&") se preferir array
      } else {
        const numValue = Number(value);
        tmp[key] = !isNaN(numValue) && value.trim() !== "" ? numValue : value;
      }
    });

    return tmp as T;
  }, []);

  // Convert filters to URL params
  const filtersToUrlParams = useCallback((fs: T): URLSearchParams => {
    const params = new URLSearchParams();

    Object.entries(fs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(","));
          }
        } else {
          params.set(key, String(value));
        }
      }
    });

    return params;
  }, []);

  // Initialize filters from URL
  const [filters, setFilters] = useState<T>(() =>
    parseUrlParamsToFilters(searchParams)
  );

  // Calculate active filters count
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (excludeFromCount.includes(key as keyof T)) return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== "";
  }).length;

  // Update URL when filters change (no-op if params didn't change)
  const updateUrlWithFilters = useCallback(
    (newFilters: T) => {
      const params = filtersToUrlParams(newFilters);
      const newParamsStr = params.toString();
      const currentParamsStr = searchParams.toString();
      if (newParamsStr === currentParamsStr) return; // avoid unnecessary replace
      const newUrl = newParamsStr ? `${pathname}?${newParamsStr}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, filtersToUrlParams, searchParams]
  );

  // Update filters and URL
  const updateFilters = useCallback(
    (newFilters: T) => {
      setFilters((prev) =>
        areFiltersEqual(prev, newFilters) ? prev : newFilters
      );
      updateUrlWithFilters(newFilters);
    },
    [updateUrlWithFilters, areFiltersEqual]
  );

  // Listen to URL changes but avoid resetting state if values are equal
  useEffect(() => {
    const urlFilters = parseUrlParamsToFilters(searchParams);
    setFilters((prev) =>
      areFiltersEqual(prev, urlFilters) ? prev : urlFilters
    );
  }, [searchParams, parseUrlParamsToFilters, areFiltersEqual]);

  useEffect(() => {
    if (searchParams.toString().length === 0) {
      updateUrlWithFilters(defaultFilters);
    }
  }, [defaultFilters, searchParams, updateUrlWithFilters]);

  return {
    filters,
    updateFilters,
    activeFiltersCount,
    resetFilters: () => updateFilters(defaultRef.current),
  };
}
