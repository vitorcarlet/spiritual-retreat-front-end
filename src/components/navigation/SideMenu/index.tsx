"use client";
import { useEffect } from "react";
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
  useTheme,
} from "@mui/material";
import { Iconify } from "../../Iconify";
import { useMenuAccess } from "@/src/hooks/useMenuAccess";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDrawer } from "@/src/contexts/DrawerContext";

const SideMenu = () => {
  const {
    mobileOpen,
    drawerWidth,
    handleDrawerTransitionEnd,
    handleDrawerClose,
    openPersistent,
    handleDrawerPersistentToggle,
  } = useDrawer();
  const { getAccessibleMenus, debugUserAccess } = useMenuAccess();
  const router = useRouter();
  const theme = useTheme();
  const isXsUp = theme.breakpoints.up("xs");
  // ✅ Obter apenas os menus que o usuário tem acesso
  const accessibleMenus = getAccessibleMenus();

  const drawerContent = (
    <div>
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

        {isXsUp && (
          <IconButton onClick={handleDrawerPersistentToggle} size="small">
            <Iconify icon="lucide:chevron-left" />
          </IconButton>
        )}
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
    </div>
  );

  // Debug (remover em produção)
  useEffect(() => {
    debugUserAccess();
  }, []);

  console.log("SessionMenu:", accessibleMenus);

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
        slotProps={{
          root: {
            keepMounted: true,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            sm: "block",
          },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
        open={openPersistent}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
export default SideMenu;
