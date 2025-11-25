import type {
  FilterConfig,
  DateFilterConfig,
  UseFiltersConfig,
} from "@/src/hooks/filters/types";

// Re-export types from types.d.ts
export type UsersTableFilters = {
  name?: string;
  state?: string;
  city?: string;
  status?: string;
};

export type UsersTableDateFilters = {
  periodStart?: string;
  periodEnd?: string;
};

/**
 * Configuração dos filtros de items para a tabela de usuários.
 * Use chaves de tradução (titleKey) que serão traduzidas pelo hook.
 */
export const usersFiltersConfig: FilterConfig[] = [
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
 * Configuração dos filtros de data para a tabela de usuários.
 */
export const usersDateFiltersConfig: DateFilterConfig<UsersTableDateFilters>[] =
  [
    { titleKey: "periodStart", filterKey: "periodStart" },
    { titleKey: "periodEnd", filterKey: "periodEnd" },
  ];

/**
 * Configuração completa pronta para usar no useFilters genérico.
 */
export const usersFiltersFullConfig: UseFiltersConfig<UsersTableDateFilters> = {
  filtersConfig: usersFiltersConfig,
  dateFiltersConfig: usersDateFiltersConfig,
  dateRangeTitleKey: "period",
  dateVariant: "dateRange",
};
