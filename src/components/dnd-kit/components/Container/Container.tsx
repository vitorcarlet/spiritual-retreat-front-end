import React, { forwardRef } from "react";
import { Box, ButtonBase, BoxProps, styled } from "@mui/material";
import { Handle, Remove } from "../Item";

export interface ContainerProps extends Omit<BoxProps, "onClick"> {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  horizontal?: boolean;
  hover?: boolean;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  unstyled?: boolean;
  onRemove?: () => void;
  handleProps?: React.HTMLAttributes<any>;
  onClick?: () => void; // se presente vira botão
}

type StyleProps = Required<
  Pick<
    ContainerProps,
    | "columns"
    | "horizontal"
    | "hover"
    | "scrollable"
    | "shadow"
    | "placeholder"
    | "unstyled"
  >
>;

const shouldForwardProp = (prop: PropertyKey) =>
  ![
    "columns",
    "horizontal",
    "hover",
    "scrollable",
    "shadow",
    "placeholder",
    "unstyled",
  ].includes(String(prop));

const baseStyles = ({ theme }: any) => ({
  "--columns": 1,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gridAutoRows: "max-content",
  overflow: "hidden",
  boxSizing: "border-box",
  outline: "none",
  minWidth: 350,
  margin: theme.spacing(1.25),
  borderRadius: theme.vars?.shape.borderRadius,
  minHeight: 200,
  transition: "background-color 200ms ease, box-shadow 180ms ease",
  backgroundColor: theme.vars?.palette.background.paper,
  border: `1px solid ${theme.vars?.palette.divider}`,
  fontSize: "1rem",
  "& ul": {
    display: "grid",
    gap: theme.spacing(1.25),
    gridTemplateColumns: "repeat(var(--columns, 1), 1fr)",
    listStyle: "none",
    padding: theme.spacing(2.5),
    margin: 0,
  },
  "&:focus-visible": {
    borderColor: "transparent",
    boxShadow: `0 0 0 2px ${theme.vars?.palette.primary.main}55`,
  },
});

const applyVariants = (p: StyleProps, theme: any) => {
  if (p.unstyled) {
    return {
      background: "none",
      border: "none",
      margin: 0,
      padding: 0,
      "& ul": {
        padding: 0,
        gap: 0,
      },
    };
  }

  const out: Record<string, any> = {
    "--columns": p.columns,
  };

  if (p.shadow) {
    out.boxShadow = theme.vars?.shadows[3];
  }

  if (p.hover) {
    out["&:hover"] = {
      backgroundColor: theme.vars?.palette.action.hover,
    };
  }

  if (p.placeholder) {
    Object.assign(out, {
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      color: theme.vars?.palette.text.secondary,
      backgroundColor: "transparent",
      borderStyle: "dashed",
      borderColor: theme.vars?.palette.divider,
      "&:hover": {
        borderColor: theme.vars?.palette.text.disabled,
      },
    });
  }

  if (p.scrollable) {
    out["& ul"] = {
      ...(out["& ul"] || {}),
      overflowY: "auto",
      maxHeight: 380,
      "&::-webkit-scrollbar": {
        width: 6,
      },
      "&::-webkit-scrollbar-thumb": {
        background: theme.vars?.palette.action.hover,
        borderRadius: 3,
      },
    };
  }

  if (p.horizontal) {
    Object.assign(out, {
      width: "100%",
      "& ul": {
        ...(out["& ul"] || {}),
        gridAutoFlow: "column",
        gridTemplateColumns: "unset",
      },
    });
  }

  return out;
};

const RootDiv = styled("div", {
  shouldForwardProp,
})<StyleProps>(({ theme, ...p }) => ({
  ...baseStyles({ theme }),
  ...applyVariants(p, theme),
}));

const RootButton = styled(ButtonBase, {
  shouldForwardProp,
})<StyleProps>(({ theme, ...p }) => ({
  ...baseStyles({ theme }),
  cursor: "pointer",
  textAlign: "left",
  "&:focus-visible": {
    outline: `2px solid ${theme.vars?.palette.primary.main}`,
    outlineOffset: 2,
  },
  ...applyVariants(p, theme),
}));

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  padding: `${theme.spacing(0.625)} ${theme.spacing(2.5)}`,
  paddingRight: theme.spacing(1),
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.vars?.palette.background.paper,
  borderTopLeftRadius: theme.vars?.shape.borderRadius,
  borderTopRightRadius: theme.vars?.shape.borderRadius,
  borderBottom: `1px solid ${theme.vars?.palette.divider}`,
  fontWeight: 600,
  fontSize: 14,
  lineHeight: 1.2,
  "&:hover .Actions > *": {
    opacity: 1,
  },
}));

const Actions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.75),
  "& > *:first-of-type:not(:last-of-type)": {
    opacity: 0,
    transition: "opacity .15s",
    "&:focus-visible": {
      opacity: 1,
    },
  },
}));

export const Container = forwardRef<HTMLElement, ContainerProps>(
  (
    {
      children,
      label,
      onRemove,
      handleProps,
      onClick,
      columns = 1,
      horizontal = false,
      hover = false,
      scrollable = false,
      shadow = false,
      placeholder = false,
      unstyled = false,
      ...rest
    },
    ref
  ) => {
    const styleProps: StyleProps = {
      columns,
      horizontal,
      hover,
      scrollable,
      shadow,
      placeholder,
      unstyled,
    };

    const Content = (
      <>
        {label && !placeholder && (
          <Header>
            <Box
              sx={{
                fontWeight: 600,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={label}
            >
              {label}
            </Box>
            <Actions className="Actions">
              {onRemove && <Remove onClick={onRemove} />}
              <Handle {...handleProps} />
            </Actions>
          </Header>
        )}
        {placeholder ? (
          children
        ) : (
          <Box component="ul" sx={{ p: 0, m: 0, listStyle: "none" }}>
            {children}
          </Box>
        )}
      </>
    );

    if (onClick) {
      return (
        <RootButton
          {...(rest as any)}
          {...styleProps}
          ref={ref as React.Ref<HTMLButtonElement>}
          onClick={onClick}
        >
          {Content}
        </RootButton>
      );
    }

    return (
      <RootDiv
        {...(rest as any)}
        {...styleProps}
        ref={ref as React.Ref<HTMLDivElement>}
      >
        {Content}
      </RootDiv>
    );
  }
);

Container.displayName = "Container";
