import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Iconify from "@/src/components/Iconify";

interface MoreMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export default function MoreMenu({ onEdit, onDelete, onView }: MoreMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleClose();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          bgcolor: "rgba(255,255,255,0.8)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
        }}
      >
        <Iconify icon="solar:menu-dots-bold" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {onView && (
          <MenuItem onClick={() => handleAction(onView)}>
            <ListItemIcon>
              <Iconify icon="solar:eye-bold" />
            </ListItemIcon>
            <ListItemText>Ver</ListItemText>
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => handleAction(onEdit)}>
            <ListItemIcon>
              <Iconify icon="solar:pen-bold" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => handleAction(onDelete)}>
            <ListItemIcon>
              <Iconify icon="solar:trash-bin-trash-bold" color="error" />
            </ListItemIcon>
            <ListItemText>Excluir</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
