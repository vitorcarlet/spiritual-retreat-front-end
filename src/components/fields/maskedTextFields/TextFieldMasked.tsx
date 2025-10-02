import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { IMaskInput } from "react-imask";
import { NumericFormat } from "react-number-format";
import SmartDateField from "../../public/retreats/form/SmartDateField";
import LocationField from "../LocalizationFields/LocationField";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  mask: string;
  value?: string | number | null;
}

const TextMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, mask, value, ...other } = props;

    // Normalizar valor para string (IMaskInput só aceita string)
    const normalizedValue = value != null ? String(value) : "";

    return (
      <IMaskInput
        {...other}
        value={normalizedValue}
        mask={mask}
        inputRef={ref}
        onAccept={(value) => onChange({ target: { name: props.name, value } })}
        overwrite
      />
    );
  }
);

// Strongly-typed adapter for react-number-format when using currency
type NumericFormatAdapterChangeEvent = {
  target: { name: string; value: string };
};
interface NumericFormatAdapterProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  name: string;
  onChange?: (event: NumericFormatAdapterChangeEvent) => void;
  value?: string | number;
}

const NumericFormatCustom = React.forwardRef<
  HTMLInputElement,
  NumericFormatAdapterProps
>(function NumericFormatCustom(props, ref) {
  const { onChange, name, type: ignoredType, ...other } = props;
  void ignoredType;
  const { defaultValue, ...rest } = other;
  const normalizedDefaultValue =
    typeof defaultValue === "string" || typeof defaultValue === "number"
      ? defaultValue
      : undefined;
  return (
    <NumericFormat
      {...rest}
      defaultValue={normalizedDefaultValue}
      getInputRef={ref}
      onValueChange={(values) => {
        // values.value is numeric string without formatting (e.g., 1234.56)
        onChange?.({ target: { name, value: values.value ?? "" } });
      }}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      prefix="R$ "
      valueIsNumericString
    />
  );
});

interface MaskConfig {
  [key: string]: string | RegExp;
}

const MASK_PATTERNS: MaskConfig = {
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
  phone: "+00 (00) 00000-0000",
  cep: "00000-000",
  num: "0000000000",
  city: /^[a-zA-ZÀ-ÿ\s]+$/,
  currency: /([0-9.,-])/, // handled via NumericFormat when selected
};

export type MaskType = keyof typeof MASK_PATTERNS | "custom";

interface TextFieldMaskedProps extends Omit<TextFieldProps, "InputProps"> {
  maskType?: MaskType | "" | null;
  customMask?: string | null;
  type?: string;
}

const TextFieldMasked: React.FC<TextFieldMaskedProps> = ({
  maskType,
  customMask,
  ...textFieldProps
}) => {
  const { type: providedType, ...restTextFieldProps } = textFieldProps;
  const normalizedMaskType = maskType && maskType !== "" ? maskType : undefined;

  if (providedType === "location" || normalizedMaskType === "location") {
    const {
      value,
      onChange,
      name,
      disabled,
      required,
      error,
      helperText,
      size,
      variant,
    } = restTextFieldProps;

    const parsedValue =
      value && typeof value === "object"
        ? (value as { stateShort?: string | null; city?: string | null })
        : undefined;

    const locationValue = {
      stateShort: parsedValue?.stateShort ?? "",
      city: parsedValue?.city ?? "",
    };

    const emitChange = (next: { stateShort: string; city: string }) => {
      if (!onChange) return;

      const event = {
        target: {
          value: next,
          name: typeof name === "string" ? name : "",
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(event);
    };

    return (
      <LocationField
        selectedState={locationValue.stateShort ?? ""}
        selectedCity={locationValue.city ?? ""}
        onStateChange={(state) =>
          emitChange({
            stateShort: state,
            city: state ? (locationValue.city ?? "") : "",
          })
        }
        onCityChange={(city) =>
          emitChange({ stateShort: locationValue.stateShort ?? "", city })
        }
        required={Boolean(required)}
        disabled={Boolean(disabled)}
        error={Boolean(error)}
        helperText={typeof helperText === "string" ? helperText : undefined}
        size={(size as "small" | "medium") ?? "medium"}
        variant={(variant as "outlined" | "filled" | "standard") ?? "outlined"}
      />
    );
  }

  // Special handling for date type: use SmartDateField
  if (providedType === "date" || normalizedMaskType === "date") {
    const {
      value,
      onChange,
      onBlur,
      name,
      label,
      placeholder,
      helperText,
      error,
      disabled,
      required,
    } = restTextFieldProps;

    return (
      <SmartDateField
        label={typeof label === "string" ? label : undefined}
        placeholder={typeof placeholder === "string" ? placeholder : undefined}
        helperText={typeof helperText === "string" ? helperText : undefined}
        error={Boolean(error)}
        disabled={Boolean(disabled)}
        required={Boolean(required)}
        value={value as string | null | undefined}
        onChange={(dateValue) => {
          if (onChange) {
            const event = {
              target: {
                value: dateValue || "",
                name: (name as string) || "",
              },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }
        }}
        onBlur={
          onBlur
            ? () => onBlur({} as React.FocusEvent<HTMLInputElement>)
            : undefined
        }
      />
    );
  }

  // Special handling for currency: use NumericFormat instead of IMask
  if (normalizedMaskType === "currency") {
    const CurrencyComponent =
      NumericFormatCustom as unknown as React.ElementType;
    return (
      <TextField
        {...restTextFieldProps}
        type="text"
        InputProps={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inputComponent: CurrencyComponent as any,
        }}
      />
    );
  }

  if (!normalizedMaskType) {
    return <TextField {...restTextFieldProps} type={providedType} />;
  }

  const resolvedMask =
    normalizedMaskType === "custom"
      ? customMask || ""
      : MASK_PATTERNS[normalizedMaskType];

  if (normalizedMaskType === "custom" && !resolvedMask) {
    return <TextField {...textFieldProps} />;
  }

  if (!resolvedMask) {
    console.warn(
      `Mask type "${normalizedMaskType}" not found. Available types: ${Object.keys(
        MASK_PATTERNS
      ).join(", ")}`
    );
    return <TextField {...restTextFieldProps} type={providedType} />;
  }

  const MaskComponent = TextMaskCustom as unknown as React.ElementType;

  return (
    <TextField
      {...restTextFieldProps}
      type={providedType}
      InputProps={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputComponent: MaskComponent as any,
      }}
      inputProps={{
        mask: resolvedMask,
      }}
    />
  );
};

export default TextFieldMasked;
