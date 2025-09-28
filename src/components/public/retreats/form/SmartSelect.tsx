"use client";

import { SyntheticEvent } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import type { BackendOption } from "./types";

export type SmartSelectValue = string | number;

interface SmartSelectProps {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  options?: BackendOption[];
  value: SmartSelectValue | null | undefined | SmartSelectValue[];
  onChange: (value: SmartSelectValue | SmartSelectValue[] | null) => void;
  error?: boolean;
  helperText?: string;
  multiple?: boolean;
  required?: boolean;
  onBlur?: () => void;
  noOptionsText?: string;
}

const normalize = (value: unknown) =>
  value === undefined || value === null ? "" : String(value);

const optionLabel = (option: BackendOption) => {
  const maybeLabel = (option as BackendOption & { label?: string | number })
    .label;
  if (maybeLabel !== undefined && maybeLabel !== null) {
    return String(maybeLabel);
  }
  return String(option.value ?? "");
};

export default function SmartSelect({
  label,
  placeholder,
  disabled,
  options,
  value,
  onChange,
  error,
  helperText,
  multiple = false,
  required,
  onBlur,
  noOptionsText = "Sem opções disponíveis",
}: SmartSelectProps) {
  const list = options ?? [];

  let selected: BackendOption[] | BackendOption | null;
  if (multiple) {
    selected = Array.isArray(value)
      ? (value as SmartSelectValue[])
          .map((val) =>
            list.find((option) => normalize(option.value) === normalize(val))
          )
          .filter((option): option is BackendOption => Boolean(option))
      : [];
  } else {
    selected =
      list.find((option) => normalize(option.value) === normalize(value)) ||
      null;
  }

  const selectedValue = multiple
    ? (selected as BackendOption[])
    : (selected as BackendOption | null);

  const handleChange = (
    _: SyntheticEvent,
    newValue: BackendOption | BackendOption[] | null
  ) => {
    if (multiple) {
      const mapped = Array.isArray(newValue)
        ? newValue.map((item) => item.value)
        : [];
      onChange(mapped);
      return;
    }

    const single = newValue as BackendOption | null;
    onChange(single ? single.value : null);
  };

  return (
    <Autocomplete
      multiple={multiple}
      disablePortal
      fullWidth
      options={list}
      value={selectedValue}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled}
      isOptionEqualToValue={(option, val) =>
        normalize(option.value) === normalize(val?.value)
      }
      getOptionLabel={optionLabel}
      disableCloseOnSelect={multiple}
      filterSelectedOptions={multiple}
      clearOnEscape
      disableClearable={required && !multiple}
      ListboxProps={{ sx: { maxHeight: 320 } }}
      slotProps={{
        popper: {
          sx: { zIndex: (theme) => theme.zIndex.modal + 1 },
        },
      }}
      noOptionsText={noOptionsText}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={normalize(option.value)}
            label={optionLabel(option)}
          />
        ))
      }
      renderInput={(params) => {
        const finalParams = {
          ...params,
          inputProps: {
            ...params.inputProps,
            placeholder: placeholder ?? params.inputProps.placeholder,
          },
        };
        return (
          <TextField
            {...finalParams}
            label={label}
            error={error}
            helperText={helperText}
            required={required}
          />
        );
      }}
    />
  );
}
