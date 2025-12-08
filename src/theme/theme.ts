"use client";
import { createTheme, shouldSkipGeneratingVar } from "@mui/material";
import breakpoints from "./breakpoints";
import { customShadows, typography } from "./core";
import { COMMON, GREY } from "./core/palette";
import ComponentsOverrides from "@/src/theme/overrides/index";

//#A6ABC8
const initialTheme = {
  colorSchemes: {
    light: {
      palette: {
        ...COMMON,
        text: {
          //primary: { primary: GREY[900], contrastText: "#fff" },
          primary: GREY[900],
          //secondary: GREY[700],
          secondary: "#797d8fff",
          disabled: GREY[500],
          menu: "#797d8fff",
          contrastText: "#797d8fff",
        },
        warning: {
          lighter: "#FFF3BF",
          light: "#FFD33D",
          main: "#f1ba23ff", // Amarelo suave do GitHub
          dark: "#B08800",
          darker: "#735C00",
          contrastText: GREY[800],
        },
        background: { paper: GREY[0], default: "#e2e2e2ff", active: "#DFE1EA" },
        action: { active: GREY[600], ...COMMON.action },
      },
    },
    dark: {
      palette: {
        ...COMMON,
        primary: {
          lighter: "#D15D00",
          light: "#FF6A00",
          main: "#FF921E",
          dark: "#FFA04D",
          darker: "#FFB66B",
          contrastText: "#fff",
        },
        secondary: {
          lighter: "#005249",
          light: "#007B55",
          main: "#00AB55",
          dark: "#5BE584",
          darker: "#C8FACD",
          contrastText: "#fff",
        },
        info: {
          lighter: "#0A3069",
          light: "#1158C7",
          main: "#1F6FEB",
          dark: "#58A6FF",
          darker: "#F0F6FC",
          contrastText: "#fff",
        },
        success: {
          lighter: "#0F3E1E",
          light: "#196127",
          main: "#00E676",
          dark: "#33EB91",
          darker: "#D6FBE9",
          contrastText: GREY[800],
        },
        warning: {
          lighter: "#735C00",
          light: "#B08800",
          main: "#F2CC60",
          dark: "#FFD33D",
          darker: "#FFF3BF",
          contrastText: GREY[800],
        },
        error: {
          lighter: "#7D181F",
          light: "#B62324",
          main: "#D73A49",
          dark: "#FF7B72",
          darker: "#FFDCE0",
          contrastText: "#fff",
        },
        text: {
          primary: "#C9D1D9",
          secondary: GREY[0],
          disabled: GREY[600],
          menu: "#797d8fff",
          contrastText: GREY[900],
        },
        background: {
          paper: GREY[900],
          default: GREY[1000],
          active: "#DFE1EA",
        },
        action: { active: GREY[500], ...COMMON.action },
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 64, // altura padrão mobile
      paddingLeft: "16px",
      paddingRight: "16px",
      "@media (min-width:600px)": {
        minHeight: 72, // altura em desktop
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
  //shadows: customShadows.light,
  shape: { borderRadius: 8 },
  // components,
  typography,
  breakpoints,
  //cssVarPrefix: "",
  customShadows: {
    ...customShadows.light,
    // ...customShadows.dark,
    // primary: `0 8px 16px 0 ${alpha(palette.light.primary.main, 0.24)}`,
  },
  shouldSkipGeneratingVar,
};

const theme = createTheme(initialTheme);
//const theme = createTheme(initialTheme);
theme.components = ComponentsOverrides(theme);

export default theme;
