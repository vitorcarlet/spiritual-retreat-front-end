import React from "react";
import { Toolbar, IconButton, Box, Badge, Paper } from "@mui/material";
import { Iconify } from "@/src/components/Iconify";
import UserMenu from "./UserIcon";

interface TopBarProps {
  onMenuToggle?: () => void;
  onUserMenuOpen?: () => void;
  onNotificationsOpen?: () => void;
}

const TopBar: React.FC<TopBarProps> = (
  {
    //onMenuToggle,
    //   onUserMenuOpen,
    //   onNotificationsOpen,
  }
) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: "appBar",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
        {/* Left side - Menu toggle */}
        <IconButton
          //onClick={onMenuToggle}
          aria-label="Toggle menu"
          size="medium"
        >
          <Iconify icon="lucide:menu" size={2.5} />
        </IconButton>

        {/* Right side - User actions */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Notifications button */}
          <IconButton
            //onClick={onNotificationsOpen}
            aria-label="Open notifications"
            size="medium"
          >
            <Badge
              badgeContent=""
              variant="dot"
              color="error"
              invisible={false} // Sempre mostrar para demo
            >
              <Iconify icon="lucide:bell" size={2.5} />
            </Badge>
          </IconButton>

          {/* User menu button */}
          <UserMenu />
        </Box>
      </Toolbar>
    </Paper>
  );
};

export default TopBar;
