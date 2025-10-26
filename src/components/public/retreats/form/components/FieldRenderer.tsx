"use client";

import React from "react";
import {
  Box,
  Stack,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormHelperText,
  RadioGroup,
  Radio,
  Typography,
  Chip,
  Switch,
} from "@mui/material";
import { Controller, type Control } from "react-hook-form";

import SmartSelect from "../SmartSelect";
import SmartDateField from "../SmartDateField";
import PhotoFieldInput from "./PhotoFieldInput";
import TextFieldMasked, {
  MaskType,
} from "@/src/components/fields/maskedTextFields/TextFieldMasked";
import type { BackendField } from "../types";
import { getOptionLabel } from "../shared";
import LocationField from "@/src/components/fields/LocalizationFields/LocationField";
import { AsynchronousAutoComplete } from "@/src/components/select-auto-complete/AsynchronousAutoComplete";
import apiClient from "@/src/lib/axiosClientInstance";

type FieldRendererProps = {
  field: BackendField;
  control: Control<Record<string, unknown>>;
  helperText?: string;
  error?: string;
  isSubmitting: boolean;
  retreatId?: string;
};

const deriveMask = (
  field: BackendField
): { maskType?: MaskType; customMask?: string } => {
  const raw = field.maskType ?? undefined;
  if (raw && raw !== "") {
    if (raw === "custom") {
      return field.customMask
        ? { maskType: "custom", customMask: field.customMask }
        : {};
    }
    return { maskType: raw as MaskType };
  }

  if (field.type === "phone") {
    return { maskType: "phone" };
  }

  if (field.type === "number") {
    return { maskType: "num" };
  }

  return {};
};

const normalizeSingleValue = (value: unknown) =>
  value === undefined || value === null || value === ""
    ? null
    : ((value as string | number) ?? null);

const normalizeMultipleValue = (value: unknown) =>
  Array.isArray(value) ? (value as (string | number)[]) : [];

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  control,
  helperText,
  error,
  isSubmitting,
  retreatId,
}) => {
  const hasError = Boolean(error);

  switch (field.type) {
    case "text":
    case "textarea":
    case "email":
    case "phone":
    case "number":
    case "date": {
      if (field.maskType === "location") {
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: rhf }) => {
              const parsedValue =
                rhf.value && typeof rhf.value === "object"
                  ? (rhf.value as {
                      stateShort?: string | null;
                      city?: string | null;
                    })
                  : undefined;

              const locationValue = {
                stateShort: parsedValue?.stateShort ?? "",
                city: parsedValue?.city ?? "",
              };

              const emitChange = (next: {
                stateShort: string;
                city: string;
              }) => {
                rhf.onChange(next);
              };

              return (
                <LocationField
                  selectedState={locationValue.stateShort}
                  selectedCity={locationValue.city}
                  onStateChange={(state) =>
                    emitChange({
                      stateShort: state,
                      city: state ? locationValue.city : "",
                    })
                  }
                  onCityChange={(city) =>
                    emitChange({
                      stateShort: locationValue.stateShort,
                      city,
                    })
                  }
                  required={field.required}
                  disabled={field.disabled || isSubmitting}
                  error={hasError}
                  helperText={helperText}
                  size="medium"
                  variant="outlined"
                />
              );
            }}
          />
        );
      }

      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => {
            const { maskType, customMask } = deriveMask(field);
            const hasMask = Boolean(maskType || customMask);

            return (
              <TextFieldMasked
                {...rhf}
                maskType={maskType}
                customMask={customMask}
                type={
                  hasMask
                    ? "text"
                    : field.type === "number"
                      ? "number"
                      : field.type === "datetime"
                        ? "datetime-local"
                        : "text"
                }
                label={field.label}
                required={field.required}
                placeholder={field.placeholder}
                disabled={field.disabled || isSubmitting}
                error={hasError}
                helperText={helperText}
                multiline={field.type === "textarea"}
                minRows={field.type === "textarea" ? 3 : undefined}
                fullWidth
                inputProps={{
                  maxLength: field.maxLength ?? undefined,
                  min: field.min,
                  max: field.max,
                }}
                onChange={(event) => {
                  const target = event.target as HTMLInputElement;
                  const nextValue = target.value;

                  if (maskType === "currency") {
                    if (field.type === "number") {
                      rhf.onChange(nextValue === "" ? "" : Number(nextValue));
                    } else {
                      rhf.onChange(nextValue);
                    }
                    return;
                  }

                  if (field.type === "number") {
                    rhf.onChange(nextValue === "" ? "" : Number(nextValue));
                    return;
                  }

                  rhf.onChange(nextValue);
                }}
              />
            );
          }}
        />
      );
    }

    case "date": {
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <SmartDateField
              label={field.label}
              value={rhf.value as string | null | undefined}
              onChange={(next) => rhf.onChange(next ?? "")}
              placeholder={field.placeholder}
              helperText={helperText}
              error={hasError}
              disabled={field.disabled || isSubmitting}
              required={field.required}
              onBlur={rhf.onBlur}
            />
          )}
        />
      );
    }

    case "select": {
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <SmartSelect
              label={field.label}
              placeholder={field.placeholder || "Selecionar"}
              disabled={field.disabled || isSubmitting}
              options={field.options}
              value={normalizeSingleValue(rhf.value)}
              onChange={(value) => {
                if (Array.isArray(value)) {
                  rhf.onChange(value.length ? value[0] : "");
                  return;
                }
                rhf.onChange(value ?? "");
              }}
              error={hasError}
              helperText={helperText}
              required={field.required}
              onBlur={rhf.onBlur}
            />
          )}
        />
      );
    }

    case "multiselect": {
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <SmartSelect
              multiple
              label={field.label}
              placeholder={field.placeholder || "Selecionar"}
              disabled={field.disabled || isSubmitting}
              options={field.options}
              value={normalizeMultipleValue(rhf.value)}
              onChange={(value) => {
                if (Array.isArray(value)) {
                  rhf.onChange(value);
                  return;
                }
                if (value === null || value === undefined) {
                  rhf.onChange([]);
                  return;
                }
                rhf.onChange([value]);
              }}
              error={hasError}
              helperText={helperText}
              required={field.required}
              onBlur={rhf.onBlur}
            />
          )}
        />
      );
    }

    case "radio": {
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <FormControl
              component="fieldset"
              error={hasError}
              disabled={field.disabled || isSubmitting}
            >
              {field.label && (
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  sx={{ mb: 0.5 }}
                >
                  {field.label}
                  {field.required ? " *" : ""}
                </Typography>
              )}
              <RadioGroup
                {...rhf}
                row
                onChange={(event) => rhf.onChange(event.target.value)}
              >
                {field.options?.map((option) => (
                  <FormControlLabel
                    key={option.id ?? option.value}
                    value={option.value}
                    control={<Radio />}
                    label={getOptionLabel(option)}
                  />
                ))}
              </RadioGroup>
              <FormHelperText>{helperText}</FormHelperText>
            </FormControl>
          )}
        />
      );
    }

    case "checkbox": {
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <FormControl
              component="fieldset"
              error={hasError}
              disabled={field.disabled || isSubmitting}
              variant="standard"
              sx={{ m: 0 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    {...rhf}
                    checked={Boolean(rhf.value)}
                    onChange={(event) => rhf.onChange(event.target.checked)}
                  />
                }
                label={[field.label, field.required ? "*" : null]
                  .filter(Boolean)
                  .join(" ")}
              />
              {helperText && <FormHelperText>{helperText}</FormHelperText>}
            </FormControl>
          )}
        />
      );
    }

    case "switch":
    case "switchExpansible": {
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <FormControl
              component="fieldset"
              error={hasError}
              disabled={field.disabled || isSubmitting}
              variant="standard"
              sx={{ m: 0 }}
            >
              <FormControlLabel
                control={
                  <Switch
                    {...rhf}
                    checked={Boolean(rhf.value)}
                    onChange={(event) => rhf.onChange(event.target.checked)}
                  />
                }
                label={[field.label, field.required ? "*" : null]
                  .filter(Boolean)
                  .join(" ")}
              />
              {helperText && <FormHelperText>{helperText}</FormHelperText>}
            </FormControl>
          )}
        />
      );
    }

    case "photo": {
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => {
            const isMultiple = Boolean(
              (field as BackendField & { isMultiple?: boolean }).isMultiple ??
                field.multiple
            );

            return (
              <PhotoFieldInput
                label={field.label}
                placeholder={field.placeholder}
                multiple={isMultiple}
                value={rhf.value}
                onChange={(nextValue) => {
                  if (isMultiple) {
                    rhf.onChange(Array.isArray(nextValue) ? nextValue : []);
                  } else {
                    rhf.onChange(nextValue instanceof File ? nextValue : null);
                  }
                }}
                disabled={field.disabled || isSubmitting}
                helperText={helperText}
                error={hasError}
                required={field.required}
              />
            );
          }}
        />
      );
    }

    case "chips": {
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => {
            const selected = normalizeMultipleValue(rhf.value);

            const toggle = (value: string | number) => {
              if (selected.includes(value)) {
                rhf.onChange(selected.filter((item) => item !== value));
              } else {
                rhf.onChange([...selected, value]);
              }
            };

            return (
              <Stack spacing={1}>
                {field.label && (
                  <Typography variant="subtitle2" fontWeight={500}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {field.options?.map((option) => {
                    const active = selected.includes(option.value);
                    return (
                      <Chip
                        key={option.id ?? option.value}
                        label={getOptionLabel(option)}
                        color={active ? "primary" : "default"}
                        variant={active ? "filled" : "outlined"}
                        onClick={() => toggle(option.value)}
                        disabled={field.disabled || isSubmitting}
                      />
                    );
                  })}
                </Box>
                <Typography
                  variant="caption"
                  color={hasError ? "error" : "text.secondary"}
                >
                  {helperText}
                </Typography>
              </Stack>
            );
          }}
        />
      );
    }

    case "asyncSelect": {
      interface ServiceSpaceOption {
        label: string;
        value: string;
        name: string;
      }

      interface ServiceSpaceApiItem {
        spaceId: string;
        name: string;
        minPeople?: number;
        maxPeople?: number;
        allocated?: number;
        [key: string]: unknown;
      }

      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => {
            // Construir URL interpolando ${retreatId} se necessário
            const constructUrl = (baseUrl: string): string => {
              if (!baseUrl) return "";
              // Interpolar ${retreatId} com o valor real do retreatId
              return baseUrl.replace("${retreatId}", retreatId || "");
            };

            // Estado para armazenar as opções em cache
            const [optionsCache, setOptionsCache] = React.useState<
              ServiceSpaceOption[]
            >([]);

            const fetchServiceSpaces = async (
              query: string
            ): Promise<ServiceSpaceOption[]> => {
              try {
                if (!field.url) {
                  throw new Error("URL não configurada para asyncSelect");
                }

                const url = constructUrl(field.url);
                console.warn("AsyncSelect URL final:", url);
                const response = await apiClient.get<{
                  items?: ServiceSpaceApiItem[];
                }>(url);

                const items = response.data?.items ?? [];

                // Transformar para formato do AsyncAutoComplete
                const options = items.map((item) => ({
                  label: item.name,
                  value: item.spaceId,
                  name: item.name,
                }));

                // Armazenar em cache para uso depois
                setOptionsCache(options);

                // Filtrar por query se fornecido
                const filtered = query
                  ? options.filter((option) =>
                      option.label.toLowerCase().includes(query.toLowerCase())
                    )
                  : options;

                return filtered;
              } catch (error) {
                console.error("Erro ao buscar espaços de serviço:", error);
                return [];
              }
            };

            // Encontrar o label correspondente ao value armazenado
            const getDisplayValue = (): ServiceSpaceOption | null => {
              if (!rhf.value) return null;

              // Primeiro, procura no cache
              const cached = optionsCache.find(
                (opt) => opt.value === rhf.value
              );
              if (cached) return cached;

              // Se não encontrar, retorna um objeto com o value como fallback
              return {
                label: String(rhf.value),
                value: String(rhf.value),
                name: "",
              };
            };

            return (
              <AsynchronousAutoComplete<ServiceSpaceOption>
                label={field.label}
                placeholder={field.placeholder || "Selecionar"}
                disabled={field.disabled || isSubmitting}
                value={getDisplayValue()}
                onChange={(value) => {
                  if (value && typeof value === "object") {
                    rhf.onChange((value as ServiceSpaceOption).value);
                  } else {
                    rhf.onChange(null);
                  }
                }}
                fetchOptions={fetchServiceSpaces}
                debounceMs={400}
                getOptionLabel={(o) => o.label}
                isOptionEqualToValue={(a, b) => a.value === b.value}
                helperText={helperText || field.helperTextContent}
                errorText={error}
              />
            );
          }}
        />
      );
    }

    default:
      return null;
  }
};

export default FieldRenderer;
