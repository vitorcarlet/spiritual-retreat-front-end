'use client'
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { ResponsiveText } from "./ResponsiveDrawer";

const SideMenu: React.FC = () => {
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
      <List>
        <ListItem>
          <ListItemButton>
            <ListItemButton>
              <ListItemText primary="Contact">
                <ResponsiveText>User</ResponsiveText>
              </ListItemText>
            </ListItemButton>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton>
            <ListItemButton>
              <ListItemText primary="Contact">
                <ResponsiveText>Contact</ResponsiveText>
              </ListItemText>
            </ListItemButton>
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
