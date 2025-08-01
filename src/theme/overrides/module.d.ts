import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Mixins {
    toolbar: {
      minHeight: number;
      paddingLeft?: string;
      paddingRight?: string;
      "@media (min-width:600px)"?: {
        minHeight: number;
      };
    };
  }

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

  interface Theme {
    customShadows: CustomShadowOptions;
  }
  interface ThemeOptions {
    customShadows?: CustomShadowOptions;
  }
}
