"use client";
import { createTheme, shouldSkipGeneratingVar } from "@mui/material";
import breakpoints from "./breakpoints";
import { customShadows, typography } from "./core";
import { COMMON, GREY } from "./core/palette";
import ComponentsOverrides from "@/src/theme/overrides/index";

const initialTheme = {
  colorSchemes: {
    light: {
      palette: {
        ...COMMON,
        text: { primary: GREY[900], secondary: GREY[700], disabled: GREY[500] },
        background: { paper: GREY[0], default: "#F0F6FC" },
        action: { active: GREY[600], ...COMMON.action },
      },
    },
    dark: {
      palette: {
        ...COMMON,
        text: { primary: "#C9D1D9", secondary: GREY[500], disabled: GREY[600] },
        background: { paper: GREY[900], default: GREY[1000] },
        action: { active: GREY[500], ...COMMON.action },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: "class" as const,
  },
  //   palette: {
  //     ...COMMON,
  //     text: { primary: GREY[900], secondary: GREY[700], disabled: GREY[500] },
  //     background: { paper: GREY[0], default: "#F0F6FC" },
  //     action: { active: GREY[600], ...COMMON.action },
  //   },
  //shadows: mode === "light" ? shadows.light : shadows.dark,
  //customShadows: mode === "light" ? customShadows.light : customShadows.dark,
  shape: { borderRadius: 8 },
  // components,
  typography,
  breakpoints,
  //cssVarPrefix: "",
  customShadows: {
    ...customShadows.light,
    // primary: `0 8px 16px 0 ${alpha(palette.light.primary.main, 0.24)}`,
  },
  shouldSkipGeneratingVar,
};

const theme = createTheme(initialTheme);
//const theme = createTheme(initialTheme);
theme.components = ComponentsOverrides(theme);

export default theme;
