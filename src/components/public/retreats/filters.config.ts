import type {
  FilterConfig,
  DateFilterConfig,
  UseFiltersConfig,
} from "@/src/hooks/filters/types";
import type {
  RetreatsCardTableFilters,
  RetreatsCardTableDateFilters,
} from "./types";

/**
 * Configuração dos filtros de items para a tabela de retiros públicos.
 * Use chaves de tradução (titleKey) que serão traduzidas pelo hook.
 */
export const retreatsFiltersConfig: FilterConfig[] = [
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
 * Configuração dos filtros de data para a tabela de retiros públicos.
 */
export const retreatsDateFiltersConfig: DateFilterConfig<RetreatsCardTableDateFilters>[] =
  [
    { titleKey: "periodStart", filterKey: "periodStart" },
    { titleKey: "periodEnd", filterKey: "periodEnd" },
  ];

/**
 * Configuração completa pronta para usar no useFilters genérico.
 */
export const retreatsFiltersFullConfig: UseFiltersConfig<RetreatsCardTableDateFilters> =
  {
    filtersConfig: retreatsFiltersConfig,
    dateFiltersConfig: retreatsDateFiltersConfig,
    dateRangeTitleKey: "period",
    dateVariant: "dateRange",
  };

// Tipos para exportação (usados no hook específico)
export type RetreatsFilters = RetreatsCardTableFilters;
export type RetreatsDateFilters = RetreatsCardTableDateFilters;
