import { IconButton, Badge, Paper, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Iconify } from "@/src/components/Iconify";
import UserMenu from "./UserIcon";
import Breadcrumbs from "./Breadcrumbs";

interface TopBarProps {
  onMenuToggle?: () => void;
  onNotificationsOpen?: () => void;
}

const TopBar = ({ onMenuToggle, onNotificationsOpen }: TopBarProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderBottom: 0,
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: "appBar",
        borderRadius: "0",
      }}
    >
      <Grid container sx={{ px: 2, minHeight: 72 }}>
        {/* Left side - Menu toggle */}
        <Grid
          size={{ xs: 12, lg: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
          gap={2}
        >
          <IconButton
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            size="medium"
          >
            <Iconify icon="lucide:menu" size={2.5} />
          </IconButton>

          {/* Center - Breadcrumbs */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "start",
              minHeight: 32,
            }}
          >
            <Breadcrumbs />
          </Box>
        </Grid>
        {/* Right side - User actions */}
        <Grid
          size={{ xs: 12, lg: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {/* Notifications button */}
          <Box marginRight={2}>
            <IconButton
              onClick={onNotificationsOpen}
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
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TopBar;
