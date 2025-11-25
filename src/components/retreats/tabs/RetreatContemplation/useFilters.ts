"use client";

import { useFilters as useGenericFilters } from "@/src/hooks/useFilters";
import {
  contemplatedFiltersFullConfig,
  type ContemplatedTableFilters,
  type ContemplatedTableDateFilters,
} from "./filters.config";

/**
 * Hook específico para filtros da tabela de contemplados (RetreatContemplation).
 * Usa o hook genérico com a configuração definida em filters.config.ts
 *
 * @example
 * ```tsx
 * const { filters, dateFilters } = useContemplatedFilters();
 * ```
 */
export const useContemplatedFilters = () => {
  return useGenericFilters<
    ContemplatedTableFilters,
    ContemplatedTableDateFilters
  >(contemplatedFiltersFullConfig);
};
