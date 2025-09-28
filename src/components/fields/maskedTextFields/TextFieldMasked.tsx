import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { IMaskInput } from "react-imask";
import { NumericFormat } from "react-number-format";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  mask: string;
}

const TextMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, mask, ...other } = props;
    return (
      <IMaskInput
        {...other}
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
  phone: "(00) 00000-0000",
  cep: "00000-000",
  num: "0000000000",
  city: /^[a-zA-ZÀ-ÿ\s]+$/,
  currency: /([0-9.,-])/, // handled via NumericFormat when selected
};

export type MaskType = keyof typeof MASK_PATTERNS | "custom";

interface TextFieldMaskedProps extends Omit<TextFieldProps, "InputProps"> {
  maskType?: MaskType | "" | null;
  customMask?: string | null;
}

const TextFieldMasked: React.FC<TextFieldMaskedProps> = ({
  maskType,
  customMask,
  ...textFieldProps
}) => {
  const { type: providedType, ...restTextFieldProps } = textFieldProps;
  const normalizedMaskType = maskType && maskType !== "" ? maskType : undefined;

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
