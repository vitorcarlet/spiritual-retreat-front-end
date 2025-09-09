"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react"; // ← Client-side signOut
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Box,
} from "@mui/material";
import { Logout, PortableWifiOffOutlined, Settings } from "@mui/icons-material";
import Iconify from "@/src/components/Iconify";

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const session = useSession();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: "/login", // Redirecionar para login
        redirect: true,
      });
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  return (
    <Box display={"flex"} gap={1} alignItems={"center"}>
      <Avatar sx={{ bgcolor: "primary.lighter", width: 36, height: 36 }}>
        👨
      </Avatar>
      <Typography>{session.data?.user?.name}</Typography>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ mr: 1, bgcolor: "transparent", width: 32, height: 32 }}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Iconify icon="lucide:chevron-down" size={3.2} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>
          <ListItemIcon>
            <PortableWifiOffOutlined fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
