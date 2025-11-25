"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { UseFiltersConfig, DateVariant } from "./filters/types";

/**
 * Hook genérico para criar filtros traduzidos a partir de configuração.
 * Retorna tipos compatíveis com o FilterButton e outros componentes existentes.
 *
 * @example
 * ```ts
 * const { filters, dateFilters } = useFilters<MyFilters, MyDateFilters>({
 *   filtersConfig: [
 *     {
 *       titleKey: "status",
 *       fields: [{ typeField: "selectAutocomplete", name: "status", url: "/api/status" }]
 *     }
 *   ],
 *   dateFiltersConfig: [
 *     { titleKey: "periodStart", filterKey: "periodStart" }
 *   ],
 *   dateRangeTitleKey: "period",
 * });
 * ```
 */
export function useFilters<T = unknown, D = unknown>(
  config: UseFiltersConfig<D>
): {
  filters: Filters<T, D>;
  dateFilters: { title: string; variantDate: DateVariant } | undefined;
} {
  const t = useTranslations();

  const filters = useMemo((): Filters<T, D> => {
    // Converte configuração de datas para formato esperado
    const dateFilters: FiltersDate<D>[] | undefined =
      config.dateFiltersConfig?.map((dateConfig) => ({
        title: t(dateConfig.titleKey as string),
        filter: dateConfig.filterKey,
      }));

    // Converte configuração de items para formato esperado
    const items: FilterItem[] = config.filtersConfig.map((filterConfig) => ({
      title: t(filterConfig.titleKey),
      fields: filterConfig.fields.map(
        (field): FilterField => ({
          typeField: field.typeField,
          name: field.name,
          url: field.url,
          primaryKey: field.primaryKey,
          onlyFirstLoad: field.onlyFirstLoad,
          isMultiple: field.isMultiple,
          placeholder: field.placeholderKey
            ? t(field.placeholderKey)
            : undefined,
          custom: field.custom,
          // Traduz opções estáticas se existirem
          options: field.staticOptions?.map((opt) => ({
            value: opt.value,
            label: t(opt.labelKey),
          })),
        })
      ),
    }));

    return {
      date: dateFilters,
      items,
      variantDate: config.dateVariant,
    };
  }, [t, config.filtersConfig, config.dateFiltersConfig, config.dateVariant]);

  const dateFilters = useMemo(() => {
    if (!config.dateRangeTitleKey) return undefined;

    return {
      title: t(config.dateRangeTitleKey),
      variantDate: config.dateVariant ?? ("dateRange" as const),
    };
  }, [t, config.dateRangeTitleKey, config.dateVariant]);

  return { filters, dateFilters };
}

export type { UseFiltersConfig } from "./filters/types";
