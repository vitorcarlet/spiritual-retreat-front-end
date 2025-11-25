import type {
  FilterConfig,
  DateFilterConfig,
  UseFiltersConfig,
} from "@/src/hooks/filters/types";
import type {
  RetreatsCardTableFilters,
  RetreatsCardTableDateFilters,
} from "../types";

/**
 * Configuração dos filtros de items para a tabela de retiros (CardTable).
 * Use chaves de tradução (titleKey) que serão traduzidas pelo hook.
 */
export const retreatsCardTableFiltersConfig: FilterConfig[] = [
  {
    titleKey: "status",
    fields: [
      {
        typeField: "selectAutocomplete",
        name: "status",
        primaryKey: "value",
        onlyFirstLoad: true,
        url: "models/filter/status/serviceOrders?type=F",
        isMultiple: true,
        custom: { variant: "custom" },
      },
    ],
  },
  {
    titleKey: "city",
    fields: [
      {
        typeField: "selectAutocomplete",
        name: "city",
        url: "clients/filter/city",
        onlyFirstLoad: true,
        isMultiple: true,
        custom: { variant: "custom" },
      },
    ],
  },
];

/**
 * Configuração dos filtros de data para a tabela de retiros.
 */
export const retreatsCardTableDateFiltersConfig: DateFilterConfig<RetreatsCardTableDateFilters>[] =
  [
    { titleKey: "periodStart", filterKey: "periodStart" },
    { titleKey: "periodEnd", filterKey: "periodEnd" },
  ];

/**
 * Configuração completa pronta para usar no useFilters genérico.
 */
export const retreatsCardTableFiltersFullConfig: UseFiltersConfig<RetreatsCardTableDateFilters> =
  {
    filtersConfig: retreatsCardTableFiltersConfig,
    dateFiltersConfig: retreatsCardTableDateFiltersConfig,
    dateRangeTitleKey: "period",
    dateVariant: "dateRange",
  };

// Tipos para exportação (usados no hook específico)
export type { RetreatsCardTableFilters, RetreatsCardTableDateFilters };
