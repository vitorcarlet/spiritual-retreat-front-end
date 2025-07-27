import { IconButton, Paper, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Iconify } from "@/src/components/Iconify";
import UserMenu from "./UserIcon";
import Breadcrumbs from "./Breadcrumbs";
import { useDrawer } from "@/src/contexts/DrawerContext";
import { Notifications } from "@mui/icons-material";

const TopBar = () => {
  const { handleDrawerToggle, handleDrawerPersistentToggle } = useDrawer();
  const theme = useTheme();
  const isXsUp = theme.breakpoints.up("xs");
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
        boxShadow: "none",
      }}
    >
      <Grid container sx={{ px: 2, minHeight: 72 }}>
        {/* Left side - Menu toggle */}
        <Grid
          size={{ xs: 12, md: 8, lg: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
          gap={2}
        >
          <IconButton
            onClick={isXsUp ? handleDrawerPersistentToggle : handleDrawerToggle}
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
          size={{ xs: 12, md: 4, lg: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {/* Notifications button */}
          <Box marginRight={2}>
            {/* <Box id={"theme-badge"} /> */}
            <Notifications />
            {/* User menu button */}
            <UserMenu />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TopBar;
