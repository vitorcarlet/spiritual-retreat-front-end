declare module "mui-color-input" {
  import type { TextFieldProps } from "@mui/material/TextField";
  import * as React from "react";

  export interface MuiColorInputProps {
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    format?: string;
    disableAlpha?: boolean;
    TextFieldProps?: TextFieldProps;
    [key: string]: unknown;
  }

  export const MuiColorInput: React.ComponentType<MuiColorInputProps>;
}
