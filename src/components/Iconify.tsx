"use client";

import { Icon, IconifyIcon, iconExists } from "@iconify/react";
import { Box, BoxProps, Typography } from "@mui/material";
import { IconColorTheme } from "../theme/core/palette";
import { memo } from "react";

type Props = BoxProps & {
  color?: IconColorTheme | string; // editar os outros arquivos um dia
  icon: IconifyIcon | string | undefined;
  size?: number;
};

const fallbackIcon = (icon: Props["icon"]) => {
  if (typeof icon !== "string" || iconExists(icon)) {
    return icon;
  }

  return icon.replace("fa6-solid:", "fa-solid:");
};

const IconifyFn = ({ icon, size = 2, sx, ...other }: Props) => {
  return (
    <Typography
      component="span"
      className="iconify"
      sx={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        minWidth: `${size * 0.625}rem`,
        minHeight: `${size * 0.625}rem`,
        // width: '100%',
        height: "100%",
        ...sx,
      }}
      {...other}
    >
      <Box
        component={Icon as any}
        icon={fallbackIcon(icon)}
        sx={{
          minWidth: `${size * 0.625}rem`,
          minHeight: `${size * 0.625}rem`,
          fontSize: `${size * 0.625}rem`,
          ...sx,
        }}
        // {...other}
      />
    </Typography>
  );
};

const Iconify = memo(IconifyFn);

export default Iconify;
