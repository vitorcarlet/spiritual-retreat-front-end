import type { Theme } from "@mui/material/styles";
import { extendTheme } from "@mui/material/styles";
import {
  typography,
  components,
  colorSchemes,

  // Assume you have defined these for light and dark modes
} from "./core";

export function createTheme(mode: "light" | "dark"): Theme {
  const initialTheme = {
    colorSchemes,
    palette: { mode, ...colorSchemes[mode]?.palette },
    //shadows: mode === "light" ? shadows.light : shadows.dark,
    //customShadows: mode === "light" ? customShadows.light : customShadows.dark,
    shape: { borderRadius: 8 },
    components,
    typography,
    cssVarPrefix: "",
    shouldSkipGeneratingVar,
  };

  return extendTheme(initialTheme);
}

function shouldSkipGeneratingVar(
  keys: string[]
  // value: string | number
): boolean {
  const skipGlobalKeys = [
    "mixins",
    "overlays",
    "direction",
    "typography",
    "breakpoints",
    "transitions",
    "cssVarPrefix",
    "unstable_sxConfig",
  ];

  const skipPaletteKeys: {
    [key: string]: string[];
  } = {
    global: ["tonalOffset", "dividerChannel", "contrastThreshold"],
    grey: ["A100", "A200", "A400", "A700"],
    text: ["icon"],
  };

  const isPaletteKey = keys[0] === "palette";

  if (isPaletteKey) {
    const paletteType = keys[1];
    const skipKeys = skipPaletteKeys[paletteType] || skipPaletteKeys.global;
    return keys.some((key) => skipKeys?.includes(key));
  }

  return keys.some((key) => skipGlobalKeys?.includes(key));
}
