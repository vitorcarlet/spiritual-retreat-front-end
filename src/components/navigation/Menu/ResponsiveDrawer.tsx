import { Drawer, styled } from "@mui/material";

export const ResponsiveDrawer = styled(Drawer)(({ theme }) => ({
  width: 60, // Mobile por padrão
  flexShrink: 0,

  // Desktop
  [theme.breakpoints.up("md")]: {
    width: 240,
  },

  "& .MuiDrawer-paper": {
    width: 60,
    boxSizing: "border-box",
  },
}));

export const ResponsiveText = styled("span")(({ theme }) => ({
  display: "none", // Esconder no mobile

  [theme.breakpoints.up("md")]: {
    display: "block",
  },
}));
