"use client";
import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { ResponsiveText } from "./ResponsiveDrawer";
import { useSession } from "next-auth/react";
import { Iconify } from "../../Iconify";

const SideMenu = () => {
  const session = useSession();

  console.log("SessionMenu:", session.data?.user.permissions);
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { xs: 60, md: 240 },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: 60, md: 240 },
          boxSizing: "border-box",
          borderRight: "0",
          backgroundColor: "background.default",
        },
      }}
    >
      <Box
        sx={{
          height: "4rem",
          display: "flex",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Typography color="primary.main" marginLeft={3} fontWeight={700}>
          SAM GESTOR
        </Typography>
      </Box>
      <List sx={{ marginLeft: 0 }}>
        <ListItem sx={{ paddingLeft: 3 }}>
          <ListItemButton>
            <ListItemIcon>
              <Iconify icon="lucide:home" />
            </ListItemIcon>
            <ListItemText primary="Contact">
              <ResponsiveText>User</ResponsiveText>
            </ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem sx={{ paddingLeft: 3 }}>
          <ListItemButton>
            <ListItemText primary="Contact">
              <ResponsiveText>Contact</ResponsiveText>
            </ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem sx={{ paddingLeft: 3 }}>
          <ListItemButton>
            <ListItemText primary="Contact">
              <ResponsiveText>Home</ResponsiveText>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};
export default SideMenu;
