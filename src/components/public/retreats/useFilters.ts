"use client";

import { useFilters as useGenericFilters } from "@/src/hooks/useFilters";
import {
  retreatsFiltersFullConfig,
  type RetreatsFilters,
  type RetreatsDateFilters,
} from "./filters.config";

/**
 * Hook específico para filtros de retreats públicos.
 * Usa o hook genérico com a configuração definida em filters.config.ts
 *
 * @example
 * ```tsx
 * const { filters, dateFilters } = useFilters();
 * ```
 */
export const useFilters = () => {
  return useGenericFilters<RetreatsFilters, RetreatsDateFilters>(
    retreatsFiltersFullConfig
  );
};
