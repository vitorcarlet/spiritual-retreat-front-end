import type {
  FilterConfig,
  DateFilterConfig,
  UseFiltersConfig,
} from "@/src/hooks/filters/types";
import type {
  ContemplatedTableFilters,
  ContemplatedTableDateFilters,
} from "./types";

/**
 * Configuração dos filtros de items para a tabela de contemplados.
 * Use chaves de tradução (titleKey) que serão traduzidas pelo hook.
 */
export const contemplatedFiltersConfig: FilterConfig[] = [
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
 * Configuração dos filtros de data para a tabela de contemplados.
 */
export const contemplatedDateFiltersConfig: DateFilterConfig<ContemplatedTableDateFilters>[] =
  [
    { titleKey: "periodStart", filterKey: "periodStart" },
    { titleKey: "periodEnd", filterKey: "periodEnd" },
  ];

/**
 * Configuração completa pronta para usar no useFilters genérico.
 */
export const contemplatedFiltersFullConfig: UseFiltersConfig<ContemplatedTableDateFilters> =
  {
    filtersConfig: contemplatedFiltersConfig,
    dateFiltersConfig: contemplatedDateFiltersConfig,
    dateRangeTitleKey: "period",
    dateVariant: "dateRange",
  };

// Tipos para exportação (usados no hook específico)
export type { ContemplatedTableFilters, ContemplatedTableDateFilters };
