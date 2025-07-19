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
import { Iconify } from "../../Iconify";
import { useMenuAccess } from "@/src/hooks/useMenuAccess";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SideMenu = () => {
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
      <List>
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
