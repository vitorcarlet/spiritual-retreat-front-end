import React, { forwardRef, CSSProperties } from "react";
import ButtonBase from "@mui/material/ButtonBase";

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties["cursor"];
}

export const Action = forwardRef<HTMLButtonElement, Props>(function Action(
  { active, cursor, style, ...props },
  ref
) {
  const fill = active?.fill;
  const bg = active?.background;
  return (
    <ButtonBase
      ref={ref}
      {...props}
      // Se ainda quiser inline style (ex: override em runtime), mantenha:
      style={
        {
          ...style,
          "--fill": fill,
          "--background": bg,
          "--action-background": bg,
        } as React.CSSProperties
      }
      sx={{
        cursor,
        display: "flex",
        width: 12,
        p: "15px",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        touchAction: "none",
        borderRadius: "5px",
        border: "none",
        outline: "none",
        appearance: "none",
        backgroundColor: "transparent",
        WebkitTapHighlightColor: "transparent",
        // Hover (desktop)
        "@media (hover: hover)": {
          "&:hover": {
            backgroundColor: "var(--action-background, rgba(0, 0, 0, 0.05))",
            "& svg": { fill: "#6f7b88" },
          },
        },
        // Fallback (mobile emulação)
        "&:hover": {
          backgroundColor: "var(--action-background, rgba(0, 0, 0, 0.05))",
          "& svg": { fill: "#6f7b88" },
        },
        "& svg": {
          flex: "0 0 auto",
          m: "auto",
          height: "100%",
          overflow: "visible",
          fill: "#919eab",
        },
        "&:active": {
          backgroundColor: "var(--background, rgba(0, 0, 0, 0.05))",
          "& svg": { fill: "var(--fill, #788491)" },
        },
        "&:focus-visible": {
          outline: "none",
          // Substitua SCSS var por uma cor do tema ou própria
          boxShadow: (theme) =>
            `0 0 0 2px rgba(255,255,255,0), 0 0 0 2px ${theme.palette.primary.main}`,
        },
      }}
      tabIndex={0}
    />
  );
});
