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
  Divider,
  IconButton,
} from "@mui/material";
import { Iconify } from "../../Iconify";
import { useMenuAccess } from "@/src/hooks/useMenuAccess";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDrawer } from "@/src/contexts/DrawerContext";

const SideMenu = () => {
  const { isDrawerOpen, drawerWidth, toggleDrawer } = useDrawer();
  const { getAccessibleMenus, debugUserAccess } = useMenuAccess();
  const router = useRouter();

  // ✅ Obter apenas os menus que o usuário tem acesso
  const accessibleMenus = getAccessibleMenus();

  // Debug (remover em produção)
  React.useEffect(() => {
    debugUserAccess();
  }, []);

  console.log("SessionMenu:", accessibleMenus);
  return (
    <Drawer
      variant="persistent" // ✅ Usar persistent ao invés de permanent
      anchor="left"
      open={isDrawerOpen}
      sx={{
        width: isDrawerOpen ? drawerWidth : 0,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          transition: "transform 0.3s ease",
        },
      }}
    >
      {/* Header do Drawer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          minHeight: 64, // Mesma altura do TopBar
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Iconify icon="lucide:mountain" size={1.8} color="primary.main" />
          <Typography variant="h6" component="div">
            SAM Gestor
          </Typography>
        </Box>

        <IconButton onClick={toggleDrawer} size="small">
          <Iconify icon="lucide:chevron-left" />
        </IconButton>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, p: 1 }}>
        {accessibleMenus.map((menu) => (
          <ListItem key={menu.id} disablePadding>
            <ListItemButton
              component={Link}
              href={menu.path}
              onClick={() => router.push(menu.path)}
            >
              <ListItemIcon>
                <Iconify icon={menu.icon} />
              </ListItemIcon>
              <ListItemText primary={menu.label} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Mostrar se não tem acesso a nada */}
        {accessibleMenus.length === 0 && (
          <ListItem>
            <ListItemText
              primary="Nenhum menu disponível"
              secondary="Entre em contato com o administrador"
            />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};
export default SideMenu;
