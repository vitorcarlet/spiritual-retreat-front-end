"use client";
import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { ResponsiveText } from "./ResponsiveDrawer";
import { useSession } from "next-auth/react";

const SideMenu: React.FC = () => {
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
        <Typography marginLeft={2}>SAM GESTOR</Typography>
      </Box>
      <List>
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Contact">
              <ResponsiveText>User</ResponsiveText>
            </ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Contact">
              <ResponsiveText>Contact</ResponsiveText>
            </ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem>
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
