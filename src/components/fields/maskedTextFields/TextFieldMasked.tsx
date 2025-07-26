import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { IMaskInput } from "react-imask";

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
  currency: "R$ num",
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
  const mask = customMask || MASK_PATTERNS[maskType];

  if (!mask) {
    console.warn(
      `Mask type "${maskType}" not found. Available types: ${Object.keys(
        MASK_PATTERNS
      ).join(", ")}`
    );
    return <TextField {...textFieldProps} />;
  }

  return (
    <TextField
      {...textFieldProps}
      slotProps={{
        input: {
          inputComponent: TextMaskCustom as any,
          inputProps: {
            mask,
          },
        },
      }}
    />
  );
};

export default TextFieldMasked;
