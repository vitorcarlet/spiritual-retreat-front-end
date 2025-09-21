import {
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  Avatar,
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Iconify from "@/src/components/Iconify";
import UserMenu from "./UserMenu";
import Breadcrumbs from "./Breadcrumbs";
import { useDrawer } from "@/src/contexts/DrawerContext";
import NotificationsMenu from "./NotificationsMenu";
import ModeSwitch from "../../navbar/mui/ModeSwitch";
import { useState } from "react";

const TopBar = () => {
  const { handleDrawerToggle, handleDrawerPersistentToggle } = useDrawer();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const [actionsDrawerOpen, setActionsDrawerOpen] = useState(false);

  const handleActionsDrawerToggle = () => {
    setActionsDrawerOpen(!actionsDrawerOpen);
  };

  const handleActionsDrawerClose = () => {
    setActionsDrawerOpen(false);
  };
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
          size={{ xs: 8 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
          gap={2}
        >
          <IconButton
            onClick={
              isDesktop ? handleDrawerPersistentToggle : handleDrawerToggle
            }
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
          size={{ xs: 4 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
          paddingRight={2}
        >
          {/* Show actions directly on large screens (>= 1200px) */}
          <Box
            sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center" }}
          >
            <ModeSwitch />
            <UserMenu />
            <NotificationsMenu />
          </Box>

          {/* Show drawer button on smaller screens (< 1200px) */}
          <Box sx={{ display: { xs: "flex", lg: "none" } }}>
            <IconButton
              onClick={handleActionsDrawerToggle}
              aria-label="More actions"
              size="medium"
            >
              <Avatar
                sx={{ bgcolor: "primary.lighter", width: 36, height: 36 }}
              >
                👨
              </Avatar>
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* Actions drawer for smaller screens */}
      <Drawer
        anchor="right"
        open={actionsDrawerOpen}
        onClose={handleActionsDrawerClose}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: 280, p: 2 },
        }}
      >
        <List sx={{ width: "100%" }}>
          <ListItem sx={{ justifyContent: "center", pb: 2 }}>
            <ModeSwitch />
          </ListItem>
          <ListItem sx={{ justifyContent: "center", pb: 2 }}>
            <UserMenu />
          </ListItem>
          <ListItem sx={{ justifyContent: "center" }}>
            <NotificationsMenu />
          </ListItem>
        </List>
      </Drawer>
    </Paper>
  );
};

export default TopBar;
