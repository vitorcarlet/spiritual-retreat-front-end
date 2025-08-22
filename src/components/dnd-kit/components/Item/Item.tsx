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
import { Box, keyframes, styled } from "@mui/material";
import { Handle, Remove } from "./components";

// Keyframes (mantém uso de CSS vars)
const pop = keyframes`
  0% { transform: scale(1); box-shadow: var(--box-shadow); }
  100% { transform: scale(var(--scale)); box-shadow: var(--box-shadow-picked-up); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

// Styled Wrapper (equivale a .Wrapper)
const Wrapper = styled("li", {
  shouldForwardProp: (prop) =>
    !["dragOverlay", "fadeIn", "sorting"].includes(String(prop)),
})<{
  dragOverlay?: boolean;
  fadeIn?: boolean;
  sorting?: boolean;
}>(({ dragOverlay, fadeIn }) => ({
  display: "flex",
  boxSizing: "border-box",
  transformOrigin: "0 0",
  touchAction: "manipulation",
  listStyle: "none",
  ...(fadeIn && {
    animation: `${fadeIn} 500ms ease`,
    animationName: fadeIn ? fadeIn : undefined,
  }),
  ...(dragOverlay && {
    "--scale": 1.05,
    "--box-shadow-picked-up":
      "0 0 0 1px rgba(63,63,68,0.05), -1px 0 15px 0 rgba(34,33,81,0.01), 0 15px 15px 0 rgba(34,33,81,0.25)",
    zIndex: 999,
  }),
}));

// Styled Item (equivale a .Item)
const ItemRoot = styled("div", {
  shouldForwardProp: (prop) =>
    !["dragOverlay", "dragging", "disabled", "withHandle", "hasColor"].includes(
      String(prop)
    ),
})<{
  dragOverlay?: boolean;
  dragging?: boolean;
  disabled?: boolean;
  withHandle?: boolean;
  hasColor?: boolean;
}>(({ theme, dragOverlay, dragging, disabled, withHandle, hasColor }) => {
  const focusColor = theme.vars?.palette.primary.main;
  return {
    position: "relative",
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    padding: "18px 20px",
    backgroundColor: theme.vars?.palette.background.default,
    boxShadow: `0 0 0 calc(1px / var(--scale-x, 1)) rgba(63,63,68,0.05),
                  0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34,33,81,0.15)`,
    outline: "none",
    borderRadius: "calc(4px / var(--scale-x, 1))",
    boxSizing: "border-box",
    transformOrigin: "50% 50%",
    WebkitTapHighlightColor: "transparent",
    color: theme.vars?.palette.text.primary,
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
});

const ActionsBox = styled(Box)({
  display: "flex",
  alignSelf: "flex-start",
  marginTop: -12,
  marginLeft: "auto",
  marginBottom: -15,
  marginRight: -10,
});

export interface Props {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
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
    dragOverlay = true,
    dragging,
    disabled,
    fadeIn = true,
    handle = true,
    handleProps,
    index,
    listeners,
    onRemove,
    renderItem,
    sorting = true,
    style,
    transition,
    transform,
    value,
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
    <Wrapper
      ref={ref}
      dragOverlay={dragOverlay}
      fadeIn={fadeIn}
      sorting={sorting}
      style={{
        ...wrapperStyle,
        transition: [transition, wrapperStyle?.transition]
          .filter(Boolean)
          .join(", "),
        "--translate-x": transform ? `${Math.round(transform.x)}px` : undefined,
        "--translate-y": transform ? `${Math.round(transform.y)}px` : undefined,
        "--scale-x": transform?.scaleX ? `${transform.scaleX}` : undefined,
        "--scale-y": transform?.scaleY ? `${transform.scaleY}` : undefined,
        "--index": index,
        "--color": color,
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
        <ActionsBox className="Actions">
          {onRemove ? <Remove className="Remove" onClick={onRemove} /> : null}
          {handle ? <Handle {...handleProps} {...listeners} /> : null}
        </ActionsBox>
      </ItemRoot>
    </Wrapper>
  );
});

Item.displayName = "Item";
export const ItemMemo = memo(Item);
