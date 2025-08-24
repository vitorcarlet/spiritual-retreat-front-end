import {
  CSSProperties,
  memo,
  ReactElement,
  ReactNode,
  Ref,
  useEffect,
  forwardRef,
} from "react";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import { Box, keyframes } from "@mui/material";
import { Handle, Remove } from "./components";

const pop = keyframes`
  0% {
    transform: scale(1);
    box-shadow: var(--box-shadow);
  }
  100% {
    transform: scale(var(--scale));
    box-shadow: var(--box-shadow-picked-up);
  }
`;

const fadeInKF = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

// Replaced styled ItemRoot with sx-based component
interface ItemRootProps {
  dragOverlay?: boolean;
  dragging?: boolean;
  disabled?: boolean;
  withHandle?: boolean;
  hasColor?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  tabIndex?: number;
  [key: string]: unknown;
}

const ItemRoot = ({
  dragOverlay,
  dragging,
  disabled,
  withHandle,
  hasColor,
  children,
  ...rest
}: ItemRootProps) => {
  return (
    <Box
      component="div"
      {...rest}
      sx={(theme) => {
        const focusColor = theme.vars?.palette.primary.main;
        return {
          position: "relative",
          display: "flex",
          flexGrow: 1,
          alignItems: "center",
          padding: "18px 20px",
          backgroundColor:
            theme.vars?.palette.background.default ||
            theme.vars?.palette.background.paper,
          boxShadow: `0 0 0 calc(1px / var(--scale-x, 1)) rgba(63,63,68,0.05), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34,33,81,0.15)`,
          outline: "none",
          borderRadius: "calc(4px / var(--scale-x, 1))",
          boxSizing: "border-box",
          transformOrigin: "50% 50%",
          WebkitTapHighlightColor: "transparent",
          color:
            theme.vars?.palette.text.primary ||
            theme.vars?.palette.text.primary,
          fontWeight: 400,
          fontSize: "1rem",
          whiteSpace: "nowrap",
          transform: "scale(var(--scale, 1))",
          transition:
            "box-shadow 200ms cubic-bezier(0.18,0.67,0.6,1.22), background-color 160ms",
          ...(withHandle
            ? { cursor: "default" }
            : { cursor: "grab", touchAction: "manipulation" }),
          "&:focus-visible": {
            boxShadow: `0 0 0 2px ${focusColor}, 0 1px 4px rgba(0,0,0,0.2)`,
          },
          ...(dragging &&
            !dragOverlay && {
              opacity: "var(--dragging-opacity, 0.5)",
            }),
          ...(disabled && {
            color: "#999",
            backgroundColor: "#f1f1f1",
            cursor: "not-allowed",
            "&:focus": {
              boxShadow: `0 0 0 2px ${focusColor}33`,
            },
          }),
          ...(dragOverlay && {
            cursor: "grabbing",
            animation: `${pop} 200ms cubic-bezier(0.18,0.67,0.6,1.22)`,
            "--scale": 1.05,
            boxShadow:
              "0 0 0 1px rgba(63,63,68,0.05), -1px 0 15px 0 rgba(34,33,81,0.01), 0 15px 15px 0 rgba(34,33,81,0.25)",
            opacity: 1,
          }),
          ...(hasColor && {
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: 0,
              height: "100%",
              width: 3,
              display: "block",
              borderTopLeftRadius: 3,
              borderBottomLeftRadius: 3,
              backgroundColor: "var(--color)",
            },
          }),
          "&:hover .Remove": {
            visibility: "visible",
          },
        };
      }}
    >
      {children}
    </Box>
  );
};

export interface Props {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: Record<string, unknown>;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: CSSProperties;
  transition?: string | null;
  wrapperStyle?: CSSProperties;
  value: ReactNode;
  children?: ReactNode;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: Ref<HTMLElement>;
    style: CSSProperties | undefined;
    transform: Props["transform"];
    transition: Props["transition"];
    value: Props["value"];
  }): ReactElement;
}

export const Item = forwardRef<HTMLLIElement, Props>(function Item(
  {
    color,
    dragOverlay,
    dragging,
    disabled,
    fadeIn,
    handle = true,
    handleProps,
    index,
    listeners,
    onRemove,
    renderItem,
    sorting,
    style,
    transition,
    transform,
    value,
    children,
    wrapperStyle,
    ...props
  },
  ref
) {
  useEffect(() => {
    if (dragOverlay) {
      document.body.style.cursor = "grabbing";
      return () => {
        document.body.style.cursor = "";
      };
    }
  }, [dragOverlay]);

  if (renderItem) {
    return renderItem({
      dragOverlay: Boolean(dragOverlay),
      dragging: Boolean(dragging),
      sorting: Boolean(sorting),
      index,
      fadeIn: Boolean(fadeIn),
      listeners,
      ref,
      style,
      transform,
      transition,
      value,
    });
  }

  return (
    <Box
      component="li"
      ref={ref}
      style={
        {
          ...wrapperStyle,
          transition,
          // ## 2. Definindo as variáveis CSS dinamicamente
          // Aqui definimos as variáveis com base nas props.
          // O `sx` abaixo irá consumí-las.
          "--translate-x": transform ? `${Math.round(transform.x)}px` : "0px",
          "--translate-y": transform ? `${Math.round(transform.y)}px` : "0px",
          "--scale-x": transform?.scaleX ? `${transform.scaleX}` : "1",
          "--scale-y": transform?.scaleY ? `${transform.scaleY}` : "1",
          "--index": index,
          "--color": color,
        } as CSSProperties
      }
      sx={{
        display: "flex",
        boxSizing: "border-box",
        transformOrigin: "0 0",
        touchAction: "manipulation",
        listStyle: "none",
        position: "relative",
        ...(fadeIn && {
          animation: `${fadeInKF} 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)`,
        }),
        ...(dragOverlay && {
          animation: `${pop} 500ms ease`,
          boxShadow: (theme) => theme.shadows[3],
          zIndex: 999,
        }),
        ...(transform && {
          transform:
            `translate3d(${Math.round(transform.x)}px, ${Math.round(
              transform.y
            )}px,0)` +
            (transform.scaleX || transform.scaleY
              ? ` scale(${transform.scaleX || 1}, ${transform.scaleY || 1})`
              : ""),
        }),
        ...(color && { color }),
        ...(typeof index === "number" &&
          ({ "--index": index } as Record<string, number>)),
        ...wrapperStyle,
      }}
    >
      <ItemRoot
        dragOverlay={dragOverlay}
        dragging={dragging}
        disabled={disabled}
        withHandle={handle}
        hasColor={Boolean(color)}
        style={style}
        data-cypress="draggable-item"
        {...(!handle ? listeners : undefined)}
        {...props}
        tabIndex={!handle ? 0 : undefined}
      >
        {value}
        <Box
          component={"span"}
          className="Actions"
          sx={{
            display: "flex",
            alignSelf: "flex-start",
            marginTop: "-12px",
            marginLeft: "auto",
            marginBottom: "-15px",
            marginRight: "-10px",
          }}
        >
          {onRemove ? <Remove className="Remove" onClick={onRemove} /> : null}
          {handle ? <Handle {...handleProps} {...listeners} /> : null}
        </Box>
        {children}
      </ItemRoot>
    </Box>
  );
});

Item.displayName = "Item";
export const ItemMemo = memo(Item);
