import IconButton from "@mui/material/IconButton";
import Iconify from "../Iconify";
import { ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import { GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";

type ActionColor =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success";

type ActionOptionsProps<T extends GridValidRowModel> = {
  actions: Array<{
    icon: string;
    label: string;
    onClick: (row: T) => void;
    color?: ActionColor;
    disabled?: (row: T) => boolean;
  }>;
  params: GridRenderCellParams<T>;
};

function ActionOptions<T extends GridValidRowModel = GridValidRowModel>({
  actions,
  params,
}: ActionOptionsProps<T>) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const getColorValue = (color: ActionColor | undefined) => {
    if (!color) return undefined;
    return `${color}.main`;
  };

  return (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="Ações"
        onClick={handleOpen}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Iconify icon="mdi:dots-vertical" size={1.6} />
      </IconButton>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 180,
              "& .MuiMenuItem-root": { gap: 1 },
            },
          },
        }}
      >
        {actions.map((action, index) => {
          const disabled = action.disabled
            ? action.disabled(params.row)
            : false;
          return (
            <MenuItem
              key={index}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
                if (!disabled) action.onClick(params.row);
              }}
              sx={
                action.color
                  ? {
                      "& .menu-item-icon": {
                        color: getColorValue(action.color),
                      },
                    }
                  : {}
              }
            >
              <Iconify
                icon={action.icon}
                className="menu-item-icon"
                size={2}
                width={20}
                height={20}
              />
              <ListItemText
                primaryTypographyProps={{
                  variant: "body2",
                  sx: action.color
                    ? {
                        color: getColorValue(action.color),
                      }
                    : {},
                }}
                primary={action.label}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </React.Fragment>
  );
}

export default ActionOptions;
