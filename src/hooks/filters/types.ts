/**
 * Tipos base para configuração de filtros reutilizáveis.
 * Use chaves de tradução (ex: "status", "city") em vez de strings traduzidas.
 */

// ============================================================================
// TIPOS DE CAMPOS (compatível com table.d.ts)
// ============================================================================

export type FieldType =
  | 'selectAutocomplete'
  | 'selectMultiple'
  | 'input'
  | 'select'
  | 'text'
  | 'number'
  | 'checkbox'
  | 'radio'
  | 'date';

// Variantes de data compatíveis com table.d.ts
export type DateVariant = 'dateRange' | 'month' | 'year' | 'day';

// ============================================================================
// OPÇÕES ESTÁTICAS (para selects sem URL)
// ============================================================================

export interface StaticOption {
  value: string | number;
  /** Chave de tradução para o label */
  labelKey: string;
}

// ============================================================================
// CONFIGURAÇÃO DE CAMPO
// ============================================================================

export interface FieldConfig {
  /** Tipo do campo */
  typeField: FieldType;
  /** Nome do campo (usado como key no objeto de filtros) */
  name: string;
  /** URL para buscar opções (selectAutocomplete) */
  url?: string;
  /** Chave primária para options vindas da API */
  primaryKey?: string;
  /** Se deve carregar options apenas na primeira vez */
  onlyFirstLoad?: boolean;
  /** Se permite múltipla seleção */
  isMultiple?: boolean;
  /** Opções estáticas (quando não usa URL) */
  staticOptions?: StaticOption[];
  /** Placeholder (chave de tradução) */
  placeholderKey?: string;
  /** Configurações customizadas */
  custom?: {
    variant?: 'custom' | 'default';
    [key: string]: unknown;
  };
}

// ============================================================================
// CONFIGURAÇÃO DE GRUPO DE FILTROS
// ============================================================================

export interface FilterConfig {
  /** Chave de tradução para o título do grupo */
  titleKey: string;
  /** Campos dentro deste grupo */
  fields: FieldConfig[];
}

// ============================================================================
// CONFIGURAÇÃO DE FILTROS DE DATA
// ============================================================================

export interface DateFilterConfig<D = unknown> {
  /** Chave de tradução para o título */
  titleKey: string;
  /** Nome do filtro (key no objeto de filtros) - deve ser uma chave válida de D */
  filterKey: keyof D;
}

// ============================================================================
// CONFIGURAÇÃO COMPLETA DO HOOK
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface UseFiltersConfig<T = unknown, D = unknown> {
  /** Configuração dos filtros de items */
  filtersConfig: FilterConfig[];
  /** Configuração dos filtros de data */
  dateFiltersConfig?: DateFilterConfig<D>[];
  /** Chave de tradução para o título do date range (ex: "period") */
  dateRangeTitleKey?: string;
  /** Variante do date picker */
  dateVariant?: DateVariant;
}

// ============================================================================
// TIPOS DE RETORNO (compatíveis com seus componentes existentes)
// Usam os tipos globais do table.d.ts
// ============================================================================

// Re-export dos tipos globais usados pelo FilterButton
// Os tipos FilterField, FilterItem, FiltersDate e Filters estão em src/types/table.d.ts
