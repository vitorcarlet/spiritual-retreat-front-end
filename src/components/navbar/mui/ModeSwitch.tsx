"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";
import { DarkMode, LightMode, SettingsBrightness } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

export default function ModeSwitch() {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  const getIcon = () => {
    switch (mode) {
      case "light":
        return <LightMode />;
      case "dark":
        return <DarkMode />;
      default:
        return <SettingsBrightness />;
    }
  };

  const handleToggle = () => {
    const modes = ["system", "light", "dark"] as const;
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        right: 0,
        bottom: 10,
        display: "flex",
        justifyContent: "flex-end",
        mt: 1,
        p: 1,
        zIndex: 1000,
      }}
    >
      <Tooltip title={`Modo: ${mode}`}>
        <IconButton onClick={handleToggle} color="primary">
          {getIcon()}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
