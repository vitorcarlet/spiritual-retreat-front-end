"use client";

import { useFilters as useGenericFilters } from "@/src/hooks/useFilters";
import {
  retreatsCardTableFiltersFullConfig,
  type RetreatsCardTableFilters,
  type RetreatsCardTableDateFilters,
} from "./filters.config";

/**
 * Hook específico para filtros da tabela de retiros (CardTable).
 * Usa o hook genérico com a configuração definida em filters.config.ts
 *
 * @example
 * ```tsx
 * const { filters, dateFilters } = useRetreatsCardTableFilters();
 * ```
 */
export const useRetreatsCardTableFilters = () => {
  return useGenericFilters<
    RetreatsCardTableFilters,
    RetreatsCardTableDateFilters
  >(retreatsCardTableFiltersFullConfig);
};
