"use client";

import { useState, useEffect } from "react";
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
import { Filters, FilterField, FiltersDate } from "@/src/types/table";

interface DynamicFiltersProps<T = any, F = any> {
  filters: Filters<T, F>;
  defaultValues?: Partial<TableDefaultFields<F>>;
  onApplyFilters: (filters: Partial<F>) => void;
  onReset?: () => void;
  open: boolean;
  onClose: () => void;
}

export default function DynamicFilters<T = any, F = any>({
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

  // Reset values when defaultValues change
  useEffect(() => {
    setFilterValues(defaultValues);
  }, [defaultValues]);

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

  const handleDateFilterChange = (filter: keyof F, dateValue: Date | null) => {
    setFilterValues((prev) => ({
      ...prev,
      [filter]: dateValue ? dateValue.toISOString() : null,
    }));
  };

  const handleDateRangeFilterChange = (
    filter: keyof F,
    startDate: Date | null,
    endDate: Date | null
  ) => {
    setFilterValues((prev) => ({
      ...prev,
      [`${filter}Start`]: startDate ? startDate.toISOString() : null,
      [`${filter}End`]: endDate ? endDate.toISOString() : null,
    }));
  };

  const handleApply = () => {
    onApplyFilters(filterValues);
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

      case "selectAutocomplete":
        return (
          <Autocomplete
            key={field.name}
            multiple={field.isMultiple}
            options={field.options || []}
            getOptionLabel={(option) => option.label}
            value={
              (filterValues as any)[field.name] ||
              (field.isMultiple ? [] : null)
            }
            onChange={(_, newValue) => handleFilterChange(field.name, newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.label}
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
          {filters.date.map((dateFilter: FiltersDate<F>) => (
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
                    value={
                      filterValues[
                        `${dateFilter.filter as string}Start` as keyof F
                      ]
                        ? new Date(
                            filterValues[
                              `${dateFilter.filter as string}Start` as keyof F
                            ] as string
                          )
                        : null
                    }
                    onChange={(date) => {
                      const endDate = filterValues[
                        `${dateFilter.filter as string}End` as keyof F
                      ]
                        ? new Date(
                            filterValues[
                              `${dateFilter.filter as string}End` as keyof F
                            ] as string
                          )
                        : null;
                      handleDateRangeFilterChange(
                        dateFilter.filter,
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
                    value={
                      filterValues[
                        `${dateFilter.filter as string}End` as keyof F
                      ]
                        ? new Date(
                            filterValues[
                              `${dateFilter.filter as string}End` as keyof F
                            ] as string
                          )
                        : null
                    }
                    onChange={(date) => {
                      const startDate = filterValues[
                        `${dateFilter.filter as string}Start` as keyof F
                      ]
                        ? new Date(
                            filterValues[
                              `${dateFilter.filter as string}Start` as keyof F
                            ] as string
                          )
                        : null;
                      handleDateRangeFilterChange(
                        dateFilter.filter,
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
                    filterValues[dateFilter.filter]
                      ? new Date(filterValues[dateFilter.filter] as string)
                      : null
                  }
                  onChange={(date) =>
                    handleDateFilterChange(dateFilter.filter, date)
                  }
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              )}
            </Paper>
          ))}
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
              {activeCategory.fields.map((field) => renderField(field))}
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
