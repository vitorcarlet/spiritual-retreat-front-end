import type { FilterConfig, UseFiltersConfig } from '@/src/hooks/filters/types';

import type { ReportsTableFilters } from './types';

/**
 * Configuração dos filtros de items para a tabela de relatórios.
 * Use chaves de tradução (titleKey) que serão traduzidas pelo hook.
 */
export const reportsFiltersConfig: FilterConfig[] = [
  {
    titleKey: 'retreat',
    fields: [
      {
        typeField: 'selectAutocomplete',
        name: 'retreatId',
        primaryKey: 'value',
        onlyFirstLoad: true,
        url: '/Retreats',
        isMultiple: true,
        custom: { variant: 'custom' },
      },
    ],
  },
];

/**
 * Configuração dos filtros de data para a tabela de relatórios.
 */
// export const reportsDateFiltersConfig: DateFilterConfig<ReportsFilters>[] =
//   [
//     { titleKey: "periodStart", filterKey: "periodStart" },
//     { titleKey: "periodEnd", filterKey: "periodEnd" },
//   ];

/**
 * Configuração completa pronta para usar no useFilters genérico.
 */
export const reportsFiltersFullConfig: UseFiltersConfig<ReportsFilters> = {
  filtersConfig: reportsFiltersConfig,
  // dateFiltersConfig: reportsDateFiltersConfig,
  dateRangeTitleKey: 'period',
  dateVariant: 'dateRange',
};

// Tipos para exportação (usados no hook específico)
export type ReportsFilters = ReportsTableFilters;
