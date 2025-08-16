"use client";

import { Icon, IconifyIcon, iconExists } from "@iconify/react";
import { Box, BoxProps } from "@mui/material";

type Props = BoxProps & {
  color?: string; // editar os outros arquivos um dia
  icon: IconifyIcon | string | undefined;
  size?: number;
};

const fallbackIcon = (icon: Props["icon"]) => {
  if (typeof icon !== "string" || iconExists(icon)) {
    return icon;
  }

  return icon.replace("fa6-solid:", "fa-solid:");
};

const Iconify = ({ icon, size = 2, sx, ...other }: Props) => {
  return (
    <Box
      component={Icon}
      icon={fallbackIcon(icon)}
      sx={{
        minWidth: `${size * 0.625}rem`,
        fontSize: `${size * 0.625}rem`,
        ...sx,
      }}
      {...other}
    />
  );
};

export default Iconify;
