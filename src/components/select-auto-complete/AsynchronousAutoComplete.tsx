/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

export interface AsyncOption {
  label: string;
  value: string | number;
  [k: string]: any;
}

export interface AsyncAutocompleteProps<
  TOption extends Record<string, any> = AsyncOption,
> {
  /**
   * Função que busca opções. Recebe (query, signal) e retorna array ou Promise.
   * Deve lançar para erro. Pode usar signal para abortar.
   */
  fetchOptions: (query: string, signal?: AbortSignal) => Promise<TOption[]>;
  /**
   * Valor atual (controlado). Para multiple = true use array.
   */
  value?: TOption | TOption[] | null;
  /**
   * Callback ao mudar valor.
   */
  onChange?: (value: TOption | TOption[] | null) => void;
  /**
   * Rótulo do campo.
   */
  label?: string;
  /**
   * Placeholder.
   */
  placeholder?: string;
  /**
   * Se múltipla seleção.
   */
  multiple?: boolean;
  /**
   * Permite texto livre.
   */
  freeSolo?: boolean;
  /**
   * Tempo de debounce (ms) para busca.
   */
  debounceMs?: number;
  /**
   * Transformador de label.
   */
  getOptionLabel?: (option: TOption) => string;
  /**
   * Compara igualdade (default compara value/id).
   */
  isOptionEqualToValue?: (opt: TOption, val: TOption) => boolean;
  /**
   * Desabilitado.
   */
  disabled?: boolean;
  /**
   * Mensagem de erro externa.
   */
  errorText?: string;
  /**
   * Texto helper.
   */
  helperText?: string;
  /**
   * Número máximo de chips visíveis (multiple).
   */
  limitTags?: number;
  /**
   * Cache em memória por query (default true).
   */
  enableCache?: boolean;
  /**
   * Query inicial / default.
   */
  initialQuery?: string;
  /**
   * Renderização customizada de opção.
   */
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: TOption
  ) => ReactNode;
  /**
   * Adiciona botão manual de recarregar.
   */
  showRefresh?: boolean;
  /**
   * Limpa quando perde foco se vazio (apenas single).
   */
  clearOnBlurEmpty?: boolean;
  /**
   * Props extras para TextField.
   */
  textFieldProps?: Omit<
    React.ComponentProps<typeof TextField>,
    "value" | "onChange" | "label" | "error" | "helperText" | "placeholder"
  >;
}

/**
 * Componente assíncrono agnóstico de fonte de dados.
 * Mantém busca com debounce, abort controller, cache simples e estados de loading/erro.
 */
export function AsynchronousAutoComplete<
  TOption extends Record<string, any> = AsyncOption,
>(props: AsyncAutocompleteProps<TOption>) {
  const {
    fetchOptions,
    value,
    onChange,
    label,
    placeholder,
    multiple,
    freeSolo,
    debounceMs = 400,
    getOptionLabel = (o: any) =>
      typeof o === "string"
        ? o
        : (o?.label ??
          o?.name ??
          (o?.value !== undefined ? String(o.value) : JSON.stringify(o))),
    isOptionEqualToValue = (a: any, b: any) =>
      (a?.value ?? a?.id) === (b?.value ?? b?.id),
    disabled,
    errorText,
    helperText,
    limitTags = 3,
    enableCache = true,
    initialQuery = "",
    renderOption,
    showRefresh = true,
    clearOnBlurEmpty = false,
    textFieldProps,
  } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [localValue, setLocalValue] = useState<TOption | TOption[] | null>(
    value ?? (multiple ? ([] as unknown as TOption[]) : null)
  );
  const [options, setOptions] = useState<TOption[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, TOption[]>>(new Map());
  const debounceRef = useRef<number | undefined>(undefined);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLocalValue(value ?? (multiple ? ([] as unknown as TOption[]) : null));
  }, [value, multiple]);
  const effectiveError = errorText || fetchError;

  const scheduleFetch = useCallback(
    (q: string, immediate = false) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      const run = async () => {
        // Se vier do cache, garanta que o loading seja desligado
        if (enableCache && cacheRef.current.has(q)) {
          setOptions(cacheRef.current.get(q)!);
          setFetchError(null);
          setLoading(false); // <-- garante não ficar travado
          return;
        }
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setFetchError(null);
        try {
          const data = await fetchOptions(q, controller.signal);
          if (!mountedRef.current) return;
          if (enableCache) cacheRef.current.set(q, data);
          setOptions(data);
        } catch (err: any) {
          if (err?.name === "AbortError") return;
          if (!mountedRef.current) return;
          setFetchError(err?.message || "Erro ao carregar opções");
          setOptions([]);
        } finally {
          if (mountedRef.current) setLoading(false);
        }
      };
      if (immediate) run();
      else {
        debounceRef.current = window.setTimeout(run, debounceMs);
      }
    },
    [fetchOptions, debounceMs, enableCache]
  );

  // Fetch inicial se aberto e sem cache
  useEffect(() => {
    if (open && options.length === 0 && !loading) {
      scheduleFetch(query || "", true);
    }
  }, [open, options.length, loading, query, scheduleFetch]);

  const handleInputChange = useCallback(
    (_: any, val: string, reason: string) => {
      if (reason === "input") {
        setQuery(val);
        scheduleFetch(val);
      }
    },
    [scheduleFetch]
  );

  const handleRefresh = useCallback(() => {
    if (enableCache) {
      cacheRef.current.delete(query);
    }
    scheduleFetch(query, true);
  }, [query, scheduleFetch, enableCache]);

  // const handleClear = useCallback(() => {
  //   onChange?.(multiple ? ([] as unknown as TOption[]) : null);
  // }, [onChange, multiple]);

  const noOptionsText = useMemo(() => {
    if (loading) return "Carregando...";
    if (fetchError) return "Erro ao carregar";
    if (query && !options.length) return "Nenhum resultado";
    return "Sem opções";
  }, [loading, fetchError, query, options.length]);

  //console.log(options, localValue, value, "hahahahah");

  return (
    <Autocomplete
      multiple={multiple}
      freeSolo={freeSolo}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={localValue}
      onChange={(_, val) => {
        onChange?.(val);
      }}
      disableCloseOnSelect={multiple}
      options={options}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionLabel={getOptionLabel as any}
      loading={loading}
      filterOptions={(x) => x} // desliga filtro client; servidor decide
      onInputChange={handleInputChange}
      clearOnBlur={clearOnBlurEmpty}
      limitTags={limitTags}
      noOptionsText={noOptionsText}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, idx) => (
          <Chip
            {...getTagProps({ index: idx })}
            key={(option as any)?.value ?? (option as any)?.id ?? idx}
            label={getOptionLabel(option as any)}
            size="small"
          />
        ))
      }
      renderOption={(params, opt) =>
        renderOption ? (
          renderOption(params, opt)
        ) : (
          <li {...params} key={(opt as any).value ?? (opt as any).id}>
            {getOptionLabel(opt)}
          </li>
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!effectiveError}
          helperText={effectiveError || helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {showRefresh && (
                    <Tooltip title="Recarregar">
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleRefresh}
                          disabled={loading || disabled}
                          tabIndex={-1}
                        >
                          <RefreshRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {loading ? (
                    <CircularProgress
                      color="inherit"
                      size={18}
                      sx={{ ml: 1, mr: 1 }}
                    />
                  ) : null}
                  {params.InputProps.endAdornment}
                </Box>
              ),
            },
          }}
          disabled={disabled}
          {...textFieldProps}
        />
      )}
    />
  );
}
