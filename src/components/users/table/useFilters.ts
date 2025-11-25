"use client";

import { useFilters as useGenericFilters } from "@/src/hooks/useFilters";
import {
  usersFiltersFullConfig,
  type UsersTableFilters,
  type UsersTableDateFilters,
} from "./filters.config";

/**
 * Hook específico para filtros da tabela de usuários.
 * Usa o hook genérico com a configuração definida em filters.config.ts
 *
 * @example
 * ```tsx
 * const { filters, dateFilters } = useUsersFilters();
 * ```
 */
export const useUsersFilters = () => {
  return useGenericFilters<UsersTableFilters, UsersTableDateFilters>(
    usersFiltersFullConfig
  );
};
