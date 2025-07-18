import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    active: string;
  }

  interface TypeText {
    menu: string;
  }

  interface PaletteOptions {
    background?: Partial<TypeBackground>;
    text?: Partial<TypeText>;
  }
}
