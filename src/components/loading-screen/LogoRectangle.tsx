"use client";

import { forwardRef } from "react";

import { BoxProps } from "@mui/system";
import NextLink from "next/link";
import { Box, useColorScheme } from "@mui/material";

interface Props extends BoxProps {
  disabledLink?: boolean;
  width?: number;
  height?: number;
}

const Logo = (mode: string | undefined) => {
  //const background = theme.palette.text.primary;
  const primary = mode === "dark" ? "#FF6A00" : "#FFA04D";
  const textColor = mode === "dark" ? "#FFF" : "#000";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      style={{ display: "block" }} // Remove espaços extras
    >
      {/* Tenda centralizada */}
      <path d="M35 50 L50 30 L65 50 L60 50 L50 37 L40 50 Z" fill={primary} />

      {/* Texto SAM centralizado */}
      <text
        x="50" // Centralizado no viewBox
        y="70" // Posicionado abaixo da tenda
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="12"
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        SAM
      </text>
    </svg>
  );
};

export const LogoRectangle = forwardRef<HTMLDivElement, Props>(
  ({ disabledLink = false, width = 100, height = 100, sx }, ref) => {
    const { mode } = useColorScheme();
    const logo = (
      <Box
        ref={ref}
        sx={{
          width,
          height,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...sx,
        }}
      >
        {Logo(mode)}
      </Box>
    );

    if (disabledLink) {
      return <>{logo}</>;
    }

    return <NextLink href="/">{logo}</NextLink>;
  }
);

LogoRectangle.displayName = "LogoRectangle";
