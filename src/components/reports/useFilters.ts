"use client";

import { useFilters as useGenericFilters } from "@/src/hooks/useFilters";
import {
  reportsFiltersFullConfig,
  type ReportsFilters,
  type ReportsDateFilters,
} from "./filters.config";

/**
 * Hook específico para filtros de relatórios.
 * Usa o hook genérico com a configuração definida em filters.config.ts
 *
 * @example
 * ```tsx
 * const { filters, dateFilters } = useReportsFilters();
 * ```
 */
export const useReportsFilters = () => {
  return useGenericFilters<ReportsFilters, ReportsDateFilters>(
    reportsFiltersFullConfig
  );
};
