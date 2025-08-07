"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface UseUrlFiltersOptions<T> {
  defaultFilters: T;
  excludeFromCount?: (keyof T)[];
}

export function useUrlFilters<T extends Record<string, any>>({
  defaultFilters,
  excludeFromCount = []
}: UseUrlFiltersOptions<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse URL params to filters
  const parseUrlParamsToFilters = useCallback((searchParams: URLSearchParams): T => {
    const filters = { ...defaultFilters };

    searchParams.forEach((value, key) => {
      if (key in filters) {
        // Handle arrays (comma-separated values)
        if (value.includes(',')) {
          (filters as any)[key] = value.split(',');
        } else {
          // Try to parse as number, otherwise keep as string
          const numValue = Number(value);
          (filters as any)[key] = !isNaN(numValue) ? numValue : value;
        }
      }
    });

    return filters;
  }, [defaultFilters]);

  // Convert filters to URL params
  const filtersToUrlParams = useCallback((filters: T): URLSearchParams => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, String(value));
        }
      }
    });

    return params;
  }, []);

  // Initialize filters from URL
  const [filters, setFilters] = useState<T>(() => parseUrlParamsToFilters(searchParams));

  // Calculate active filters count
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (excludeFromCount.includes(key as keyof T)) return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== "";
  }).length;

  // Update URL when filters change
  const updateUrlWithFilters = useCallback((newFilters: T) => {
    const params = filtersToUrlParams(newFilters);
    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router, filtersToUrlParams]);

  // Update filters and URL
  const updateFilters = useCallback((newFilters: T) => {
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  }, [updateUrlWithFilters]);

  // Listen to URL changes
  useEffect(() => {
    const urlFilters = parseUrlParamsToFilters(searchParams);
    setFilters(urlFilters);
  }, [searchParams, parseUrlParamsToFilters]);

  return {
    filters,
    updateFilters,
    activeFiltersCount,
    resetFilters: () => updateFilters(defaultFilters)
  };
}