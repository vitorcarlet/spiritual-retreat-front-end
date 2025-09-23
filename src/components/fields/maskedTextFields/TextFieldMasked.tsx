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
  const { onChange, name, ...other } = props;
  return (
    <NumericFormat
      {...other}
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

interface TextFieldMaskedProps extends Omit<TextFieldProps, "InputProps"> {
  maskType: keyof typeof MASK_PATTERNS;
  customMask?: string;
}

const TextFieldMasked: React.FC<TextFieldMaskedProps> = ({
  maskType,
  customMask,
  ...textFieldProps
}) => {
  // Special handling for currency: use NumericFormat instead of IMask
  if (maskType === "currency") {
    const CurrencyComponent =
      NumericFormatCustom as unknown as React.ElementType;
    return (
      <TextField
        {...textFieldProps}
        slotProps={{
          input: {
            inputComponent: CurrencyComponent,
          },
        }}
      />
    );
  }

  const mask = customMask || MASK_PATTERNS[maskType];

  if (!mask) {
    console.warn(
      `Mask type "${maskType}" not found. Available types: ${Object.keys(
        MASK_PATTERNS
      ).join(", ")}`
    );
    return <TextField {...textFieldProps} />;
  }

  const MaskComponent = TextMaskCustom as unknown as React.ElementType;

  return (
    <TextField
      {...textFieldProps}
      slotProps={{
        input: {
          inputComponent: MaskComponent,
          inputProps: {
            mask,
          },
        },
      }}
    />
  );
};

export default TextFieldMasked;
