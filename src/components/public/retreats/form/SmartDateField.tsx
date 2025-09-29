"use client";

import { useMemo, useState, useRef, MouseEvent, FocusEvent } from "react";
import { TextField, Popover, Stack, Button, Divider } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isValid, parseISO, addDays, addWeeks } from "date-fns";
import type { Locale } from "date-fns";

export type SmartDateFieldValue = string | number | Date | null | undefined;

export interface SmartDateQuickSelection {
  label: string;
  getValue: () => Date;
}

interface SmartDateFieldProps {
  label?: string;
  value?: SmartDateFieldValue;
  onChange: (value: string | null) => void;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  formatString?: string;
  locale?: Locale;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  quickSelections?: SmartDateQuickSelection[];
  onBlur?: () => void;
  showQuickSelections?: boolean;
  okButtonLabel?: string;
  yearButtonLabel?: string;
}

const defaultQuickSelections: SmartDateQuickSelection[] = [
  {
    label: "Hoje",
    getValue: () => new Date(),
  },
  {
    label: "Amanhã",
    getValue: () => addDays(new Date(), 1),
  },
  {
    label: "Próxima semana",
    getValue: () => addWeeks(new Date(), 1),
  },
];

const normalizeToDate = (value: SmartDateFieldValue): Date | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return isValid(fromNumber) ? fromNumber : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoParsed = parseISO(trimmed);
    if (isValid(isoParsed)) {
      return isoParsed;
    }

    const fallback = new Date(trimmed);
    return isValid(fallback) ? fallback : null;
  }

  return null;
};

export default function SmartDateField({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  disabled,
  required,
  formatString = "dd/MM/yyyy",
  locale,
  minDate,
  maxDate,
  clearable = true,
  quickSelections = defaultQuickSelections,
  onBlur,
  showQuickSelections = false,
  okButtonLabel = "OK",
  yearButtonLabel = "Selecionar ano",
}: SmartDateFieldProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentView, setCurrentView] = useState<"year" | "month" | "day">(
    "day"
  );
  const skipNextFocus = useRef(false);
  const parsedValue = useMemo(() => normalizeToDate(value), [value]);

  const displayValue = useMemo(() => {
    if (!parsedValue) {
      return "";
    }

    try {
      return format(parsedValue, formatString, { locale });
    } catch {
      return "";
    }
  }, [parsedValue, formatString, locale]);

  const handleFieldClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleFieldFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (skipNextFocus.current) {
      skipNextFocus.current = false;
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    skipNextFocus.current = true;
    setAnchorEl(null);
    setCurrentView("day");
    // Reset the guard in case no focus event occurs after closing
    window.setTimeout(() => {
      skipNextFocus.current = false;
    }, 0);
  };

  const updateValue = (date: Date | null) => {
    if (!date) {
      onChange(null);
      return;
    }

    if (minDate && date < minDate) {
      onChange(format(minDate, "yyyy-MM-dd"));
      return;
    }

    if (maxDate && date > maxDate) {
      onChange(format(maxDate, "yyyy-MM-dd"));
      return;
    }

    onChange(format(date, "yyyy-MM-dd"));
  };

  const handleDateChange = (date: Date | null) => {
    updateValue(date);
    if (date) {
      setCurrentView("day");
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "smart-date-field-popover" : undefined;
  const resolvedQuickSelections = showQuickSelections
    ? (quickSelections ?? defaultQuickSelections)
    : [];
  const hasQuickActions =
    (resolvedQuickSelections?.length ?? 0) > 0 || clearable;

  return (
    <>
      <TextField
        label={label}
        value={displayValue}
        onClick={handleFieldClick}
        onFocus={handleFieldFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        helperText={helperText}
        error={error}
        disabled={disabled}
        required={required}
        fullWidth
        InputProps={{
          readOnly: true,
          endAdornment: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                cursor: disabled ? "default" : "pointer",
                marginRight: 4,
              }}
              onClick={disabled ? undefined : handleFieldClick}
              tabIndex={-1}
              aria-label="Abrir calendário"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#757575" }}
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
          ),
        }}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { px: 2, py: 1.5, minWidth: 320 } } }}
      >
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={locale}
        >
          <Stack spacing={1.5}>
            {hasQuickActions && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {resolvedQuickSelections?.map((selection) => (
                  <Button
                    key={selection.label}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      updateValue(selection.getValue());
                      handleClose();
                    }}
                  >
                    {selection.label}
                  </Button>
                ))}
                {clearable && (
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => {
                      onChange(null);
                      handleClose();
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </Stack>
            )}

            {hasQuickActions && <Divider />}

            <DateCalendar
              value={parsedValue}
              onChange={handleDateChange}
              disabled={disabled}
              minDate={minDate}
              maxDate={maxDate}
              views={["year", "month", "day"]}
              view={currentView}
              onViewChange={(nextView) => setCurrentView(nextView)}
              sx={{
                "& .MuiPickersDay-root": {
                  fontWeight: 500,
                  borderRadius: 1.5,
                },
                "& .MuiPickersCalendarHeader-label": {
                  fontWeight: 600,
                  textTransform: "capitalize",
                },
              }}
            />

            <Divider />

            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Button
                variant="text"
                size="small"
                onClick={() => setCurrentView("year")}
              >
                {yearButtonLabel}
              </Button>
              <Button variant="contained" size="small" onClick={handleClose}>
                {okButtonLabel}
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Popover>
    </>
  );
}
