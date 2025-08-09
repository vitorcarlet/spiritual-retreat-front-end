"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ptBR } from "date-fns/locale";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
  Chip,
  FormControlLabel,
  Checkbox,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Iconify from "../Iconify";
import { allFilters } from "./FilterButton";

type StringKey<T> = Extract<keyof T, string>;

interface DynamicFiltersProps<T, F> {
  filters: Filters<T, F>;
  defaultValues?: Partial<TableDefaultFilters<F>>;
  onApplyFilters: (filters: Partial<allFilters<T, F>>) => void;
  onReset?: () => void;
  open: boolean;
  onClose: () => void;
}

export default function DynamicFilters<T, F>({
  filters,
  defaultValues = {},
  onApplyFilters,
  onReset,
  open,
  onClose,
}: DynamicFiltersProps<T, F>) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"date" | "filters">("date");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Partial<F>>(defaultValues);

  const defaultValuesKey = useMemo(
    () => JSON.stringify(defaultValues ?? {}),
    [defaultValues]
  );

  // Build a quick lookup for select fields (name -> config)
  const selectFieldConfig = useMemo(() => {
    const map = new Map<string, { multiple?: boolean; primaryKey?: string }>();
    filters.items?.forEach((cat: FilterItem) => {
      (cat.fields ?? []).forEach((field: FilterField) => {
        if (field?.typeField === "selectAutocomplete") {
          map.set(field.name, {
            multiple: field.isMultiple,
            primaryKey: field.primaryKey || "value",
          });
        }
      });
    });
    return map;
  }, [filters.items]);

  // Helpers for Autocomplete options/values
  const getPrimaryKey = (name: string) =>
    selectFieldConfig.get(name)?.primaryKey || "value";
  const getOptionLabelSafe = (option: any, name?: string) => {
    if (option == null) return "";
    if (typeof option === "string" || typeof option === "number")
      return String(option);
    if (option.label != null) return String(option.label);
    const pk = name ? getPrimaryKey(name) : "value";
    if (option[pk] != null) return String(option[pk]);
    return "";
  };
  const isOptionEqualToValueSafe = (option: any, value: any, name: string) => {
    const pk = getPrimaryKey(name);
    const optVal =
      typeof option === "object" && option
        ? option[pk] ?? option.value ?? option.id
        : option;
    const valVal =
      typeof value === "object" && value
        ? value[pk] ?? value.value ?? value.id
        : value;
    return String(optVal) === String(valVal);
  };
  const normalizeToOption = (v: any, options: any[], name: string) => {
    const pk = getPrimaryKey(name);
    if (v == null) return null;
    if (typeof v === "object") return v; // assume already option
    const found = options.find(
      (o: any) => String(o?.[pk] ?? o?.value ?? o?.id) === String(v)
    );
    return (
      found || {
        [pk]: v,
        label: String(v),
      }
    );
  };
  const serializeFromOption = (v: any, name: string) => {
    const pk = getPrimaryKey(name);
    if (v == null) return v;
    return typeof v === "object" ? v?.[pk] ?? v?.value ?? v?.id ?? null : v;
  };

  // Normalize incoming defaults from URL into local state shape (e.g., map `period` => `periodStart`/`periodEnd`)
  const normalizeDefaults = useCallback(
    (values: Partial<F>): Partial<F> => {
      const next: Record<string, unknown> = {
        ...(values as Record<string, unknown>),
      };
      if (
        filters.variantDate &&
        filters.date &&
        filters.variantDate === "dateRange"
      ) {
        for (const d of filters.date) {
          const key = String(d.filter);
          const startKey = `${key}Start`;
          const endKey = `${key}End`;
          const dateRangeValue = next[key];

          // Parse date range string like "2025-08-01&2025-08-08"
          if (
            typeof dateRangeValue === "string" &&
            dateRangeValue.includes("&") &&
            next[startKey] == null &&
            next[endKey] == null
          ) {
            const [start, end] = dateRangeValue.split("&");
            next[startKey] = start || null;
            next[endKey] = end || null;
          }
          // Handle legacy array format [start, end]
          else if (
            Array.isArray(dateRangeValue) &&
            dateRangeValue.length &&
            next[startKey] == null &&
            next[endKey] == null
          ) {
            next[startKey] = dateRangeValue[0]
              ? String(dateRangeValue[0]).slice(0, 10)
              : null;
            next[endKey] = dateRangeValue[1]
              ? String(dateRangeValue[1]).slice(0, 10)
              : null;
          }
        }
      }
      return next as Partial<F>;
    },
    [filters.variantDate, filters.date]
  );

  // Sync local state with defaultValues when content actually changed and when drawer is open
  useEffect(() => {
    if (!open) return; // sync only when drawer is open
    setFilterValues((prev) => {
      const prevKey = JSON.stringify(prev ?? {});
      if (prevKey === defaultValuesKey) return prev; // avoid redundant updates
      const normalized = normalizeDefaults((defaultValues as Partial<F>) ?? {});
      return normalized;
    });
  }, [defaultValuesKey, open, normalizeDefaults, defaultValues]);

  // Set first category as selected by default when drawer opens
  useEffect(() => {
    if (
      open &&
      filters.items &&
      filters.items.length > 0 &&
      !selectedCategory
    ) {
      setSelectedCategory(filters.items[0].title);
    }
  }, [open, filters.items, selectedCategory]);

  const handleTabChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: "date" | "filters" | null
  ) => {
    if (newValue !== null) {
      setActiveTab(newValue);
      // Reset selected category when switching to filters tab
      if (newValue === "filters" && filters.items && filters.items.length > 0) {
        setSelectedCategory(filters.items[0].title);
      }
    }
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateFilterChange = <K extends StringKey<F>>(
    filter: K,
    dateValue: Date | null
  ) => {
    const key = `${String(filter)}` as K;
    setFilterValues((prev) => ({
      ...prev,
      [key]: dateValue
        ? dateValue.toISOString().slice(0, 10) // YYYY-MM-DD only
        : null,
    }));
  };

  const handleDateRangeFilterChange = <K extends StringKey<F>>(
    filter: K,
    startDate: Date | null,
    endDate: Date | null
  ) => {
    const startKey = `${String(filter)}Start` as `${K}Start`;
    const endKey = `${String(filter)}End` as `${K}End`;

    setFilterValues((prev) => {
      // Format dates as YYYY-MM-DD only (no time)
      const startFormatted = startDate ? startDate.toISOString().slice(0, 10) : null;
      const endFormatted = endDate ? endDate.toISOString().slice(0, 10) : null;
      
      return {
        ...prev,
        [startKey]: startFormatted,
        [endKey]: endFormatted,
        // Create a clean date range string for URL: "2025-08-01&2025-08-08"
        [filter]:
          startFormatted || endFormatted
            ? `${startFormatted || ''}&${endFormatted || ''}` as unknown as F[typeof filter]
            : (undefined as unknown as F[typeof filter]),
      } as typeof prev;
    });
  };

  const handleApply = () => {
    // serialize any selectAutocomplete values back to primitives for URL syncing
    const cleaned: Record<string, unknown> = {};
    Object.entries(filterValues as Record<string, unknown>).forEach(
      ([name, value]) => {
        if (selectFieldConfig.has(name)) {
          const cfg = selectFieldConfig.get(name)!;
          if (cfg.multiple) {
            const arr = Array.isArray(value)
              ? value
              : value == null
              ? []
              : [value];
            cleaned[name] = arr
              .map((v) => serializeFromOption(v, name))
              .filter((v) => v !== null && v !== undefined);
          } else {
            cleaned[name] = serializeFromOption(value, name);
          }
        } else {
          cleaned[name] = value as unknown;
        }
      }
    );

    // Format date filters for URL
    if (filters.date && filters.date.length) {
      for (const d of filters.date as FiltersDate<F>[]) {
        const key = String(d.filter);
        const startKey = `${key}Start`;
        const endKey = `${key}End`;
        
        if (filters.variantDate === "dateRange") {
          const start = (filterValues as any)[startKey];
          const end = (filterValues as any)[endKey];
          
          if (start || end) {
            // Format as "2025-08-01&2025-08-08" for URL
            cleaned[key] = `${start || ''}&${end || ''}`;
          }
          delete cleaned[startKey];
          delete cleaned[endKey];
        } else {
          const single = (filterValues as any)[key];
          if (single != null && single !== "") {
            // Ensure single dates are also formatted as YYYY-MM-DD
            if (single instanceof Date) {
              cleaned[key] = single.toISOString().slice(0, 10);
            } else {
              cleaned[key] = single;
            }
          }
          delete cleaned[startKey];
          delete cleaned[endKey];
        }
      }
    }

    onApplyFilters(cleaned as Partial<allFilters<T, F>>);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setFilterValues({});
    }
  };

  // Render fields based on their type
  const renderField = (field: FilterField) => {
    switch (field.typeField) {
      case "input":
        return (
          <TextField
            key={field.name}
            fullWidth
            size="small"
            label={field.label}
            placeholder={field.placeholder}
            value={(filterValues as any)[field.name] || ""}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            margin="normal"
          />
        );

      case "selectAutocomplete": {
        const name = field.name as string;
        const options = field.options || [];
        const raw = (filterValues as any)[name];
        if (field.isMultiple) {
          const value = (
            Array.isArray(raw) ? raw : raw == null ? [] : [raw]
          ).map((v: any) => normalizeToOption(v, options, name));
          return (
            <Autocomplete
              key={name}
              multiple
              options={options}
              getOptionLabel={(option) => getOptionLabelSafe(option, name)}
              isOptionEqualToValue={(opt, val) =>
                isOptionEqualToValueSafe(opt as any, val as any, name)
              }
              value={value as any}
              onChange={(_, newValue) => {
                const serialized = (newValue as any[]).map((v) =>
                  serializeFromOption(v, name)
                );
                handleFilterChange(name, serialized);
              }}
              renderTags={(vals, getTagProps) =>
                (vals as any[]).map((option, index) => (
                  // eslint-disable-next-line react/jsx-key
                  <Chip
                    label={getOptionLabelSafe(option, name)}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={field.label}
                  placeholder={field.placeholder}
                  margin="normal"
                  size="small"
                />
              )}
            />
          );
        } else {
          const value = normalizeToOption(raw, options, name);
          return (
            <Autocomplete
              key={name}
              options={options}
              getOptionLabel={(option) => getOptionLabelSafe(option, name)}
              isOptionEqualToValue={(opt, val) =>
                isOptionEqualToValueSafe(opt as any, val as any, name)
              }
              value={value as any}
              onChange={(_, newValue) => {
                const serialized = serializeFromOption(newValue, name);
                handleFilterChange(name, serialized);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={field.label}
                  placeholder={field.placeholder}
                  margin="normal"
                  size="small"
                />
              )}
            />
          );
        }
      }

      case "checkbox":
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={!!(filterValues as any)[field.name]}
                onChange={(e) =>
                  handleFilterChange(field.name, e.target.checked)
                }
              />
            }
            label={field.label}
          />
        );

      default:
        return null;
    }
  };

  // Render date filters
  const renderDateFilters = () => {
    if (!filters.date || filters.date.length === 0) {
      return (
        <Typography sx={{ p: 2 }}>Nenhum filtro de data configurado</Typography>
      );
    }

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Stack spacing={3} sx={{ p: 2 }}>
          {filters.date.map((dateFilter: FiltersDate<F>) => {
            const baseKey = String(dateFilter.filter);
            const startKey = `${baseKey}Start` as keyof typeof filterValues;
            const endKey = `${baseKey}End` as keyof typeof filterValues;
            const tuple = (filterValues as any)[baseKey] as
              | string[]
              | undefined;
            const startStr =
              (filterValues as any)[startKey] ??
              (Array.isArray(tuple) ? tuple[0] : undefined);
            const endStr =
              (filterValues as any)[endKey] ??
              (Array.isArray(tuple) ? tuple[1] : undefined);
            return (
              <Paper
                key={String(dateFilter.filter)}
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {dateFilter.title}
                </Typography>

                {filters.variantDate === "dateRange" ? (
                  // Date range filter with start and end date
                  <Stack direction="row" spacing={2}>
                    <DatePicker
                      label={t("startDate")}
                      value={startStr ? new Date(startStr) : null}
                      onChange={(date) => {
                        const endDate = endStr ? new Date(endStr) : null;
                        handleDateRangeFilterChange(
                          dateFilter.filter as StringKey<F>,
                          date,
                          endDate
                        );
                      }}
                      slotProps={{
                        textField: { fullWidth: true, size: "small" },
                      }}
                    />
                    <DatePicker
                      label={t("endDate")}
                      value={endStr ? new Date(endStr) : null}
                      onChange={(date) => {
                        const startDate = startStr ? new Date(startStr) : null;
                        handleDateRangeFilterChange(
                          dateFilter.filter as StringKey<F>,
                          startDate,
                          date
                        );
                      }}
                      slotProps={{
                        textField: { fullWidth: true, size: "small" },
                      }}
                    />
                  </Stack>
                ) : (
                  // Single date filter
                  <DatePicker
                    label={dateFilter.title}
                    value={
                      (filterValues as any)[dateFilter.filter]
                        ? new Date(
                            (filterValues as any)[dateFilter.filter] as string
                          )
                        : null
                    }
                    onChange={(date) =>
                      handleDateFilterChange(
                        dateFilter.filter as StringKey<F>,
                        date
                      )
                    }
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                  />
                )}
              </Paper>
            );
          })}
        </Stack>
      </LocalizationProvider>
    );
  };

  // Render other filters
  const renderOtherFilters = () => {
    if (!filters.items || filters.items.length === 0) {
      return <Typography sx={{ p: 2 }}>Nenhum filtro configurado</Typography>;
    }

    const activeCategory = filters.items.find(
      (item) => item.title === selectedCategory
    );

    return (
      <Stack direction="row" sx={{ height: "100%" }}>
        <List
          sx={{
            width: 200,
            borderRight: 1,
            borderColor: "divider",
            height: "100%",
            overflowY: "auto",
          }}
        >
          {filters.items.map((item) => (
            <ListItemButton
              key={item.title}
              selected={selectedCategory === item.title}
              onClick={() => handleSelectCategory(item.title)}
            >
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  color:
                    selectedCategory === item.title ? "primary" : "textPrimary",
                }}
              />
              <Iconify icon="solar:arrow-right-linear" />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
          {activeCategory ? (
            <Stack spacing={2}>
              <Typography variant="subtitle1">
                {activeCategory.title}
              </Typography>
              {(activeCategory.fields ?? []).map((field: FilterField) =>
                renderField(field)
              )}
            </Stack>
          ) : (
            <Typography>Selecione uma categoria</Typography>
          )}
        </Box>
      </Stack>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 500 }, maxWidth: "100%" },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6">{t("filters")}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-circle-bold" />
          </IconButton>
        </Box>

        {/* Toggle between Date and Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={handleTabChange}
            aria-label="filter tabs"
            fullWidth
            size="small"
          >
            <ToggleButton value="date" aria-label="date filters">
              <Iconify icon="solar:calendar-mark-bold" sx={{ mr: 1 }} />
              {t("date")}
            </ToggleButton>
            <ToggleButton value="filters" aria-label="other filters">
              <Iconify icon="solar:filter-bold" sx={{ mr: 1 }} />
              {t("filters")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Content - Either Date filters or Other filters */}
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          {activeTab === "date" ? renderDateFilters() : renderOtherFilters()}
        </Box>

        {/* Actions */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button
            variant="text"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={handleReset}
          >
            {t("cleanUp")}
          </Button>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onClose}>
              {t("toClose")}
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:check-circle-bold" />}
              onClick={handleApply}
            >
              {t("apply")}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
