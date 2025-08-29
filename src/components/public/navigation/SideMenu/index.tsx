"use client";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useTheme,
  styled,
  CSSObject,
  Theme,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useDrawer } from "@/src/contexts/DrawerContext";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { BreadCrumbsProvider } from "@/src/contexts/BreadCrumbsContext";
import Iconify from "@/src/components/Iconify";
import TopBar from "../TopBar";
import { menuConfig } from "./shared";

const drawerWidth: number = 240; // Largura fixa do drawer

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  zIndex: theme.zIndex.drawer - 3,
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer - 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  boxShadow: "none",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const ResponsiveDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  backgroundColor: "background.default",
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiPaper-root": {
    backgroundColor: "inherit",
  },
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

const SideMenuDrawer = ({ children }: { children: React.ReactNode }) => {
  const {
    mobileOpen,
    drawerWidth,
    handleDrawerTransitionEnd,
    handleDrawerClose,
    openPersistent,
    handleDrawerPersistentToggle,
  } = useDrawer();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  // ✅ Obter apenas os menus que o usuário tem acesso

  const drawerContent = (
    <>
      <Divider />
      <List sx={{ flexGrow: 1, p: 1, pl: 0 }}>
        {menuConfig.map((menu) => (
          <ListItem key={menu.id} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={pathname === menu.path}
              sx={[
                openPersistent
                  ? { justifyContent: "initial" }
                  : { justifyContent: "center" },
              ]}
              component={Link}
              href={menu.path}
              onClick={() => router.push(menu.path)}
            >
              <ListItemIcon sx={[openPersistent ? { mr: 3 } : { mr: "auto" }]}>
                <Iconify icon={menu.icon} />
              </ListItemIcon>
              <ListItemText
                primary={menu.label}
                sx={[
                  openPersistent
                    ? { opacity: 1, visibility: "visible" }
                    : { opacity: 0, visibility: "hidden" },
                ]}
              />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Mostrar se não tem acesso a nada */}
        {menuConfig.length === 0 && (
          <ListItem>
            <ListItemText
              primary="Nenhum menu disponível"
              secondary="Entre em contato com o administrador"
            />
          </ListItem>
        )}
      </List>
    </>
  );

  return (
    <Box id="side-menu-drawer" sx={{ display: "flex", height: "100vh" }}>
      <BreadCrumbsProvider noBreadCrumbs={true}>
        <AppBar position="fixed" open={openPersistent}>
          <Box sx={{ backgroundColor: "background.paper" }}>
            <TopBar />
          </Box>
        </AppBar>
        <ResponsiveDrawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            backgroundColor: "background.default",
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
        </ResponsiveDrawer>
        <ResponsiveDrawer
          variant="permanent"
          // sx={{
          //   display: {
          //     xs: "none",
          //     sm: "block",
          //   },
          //   "& .MuiDrawer-paper": {
          //     boxSizing: "border-box",
          //     width: drawerWidth,
          //   },
          // }}
          sx={{ zIndex: 1000 }}
          open={openPersistent}
        >
          <DrawerHeader>
            <Iconify icon="lucide:mountain" size={1.8} color="primary.main" />
            <Typography
              variant="h6"
              component="div"
              sx={[
                openPersistent
                  ? { opacity: 1, visibility: "visible" }
                  : { opacity: 0, visibility: "hidden" },
              ]}
            >
              SAM Gestor
            </Typography>
            <IconButton
              onClick={handleDrawerPersistentToggle}
              sx={[
                openPersistent
                  ? { opacity: 1, visibility: "visible" }
                  : { opacity: 0 },
              ]}
            >
              {theme.direction === "rtl" ? (
                <Iconify icon="lucide:chevron-right" size={2} />
              ) : (
                <Iconify icon="lucide:chevron-left" size={2} />
              )}
            </IconButton>
          </DrawerHeader>
          {drawerContent}
        </ResponsiveDrawer>
        <Box
          sx={{
            backgroundColor: "background.paper",
            //p: 2,
            width: "calc(100% - 240px)", // ✅ Agora funciona perfeitamente
            height: "100%",
            flexGrow: 1,
          }}
        >
          <DrawerHeader />
          <Box
            sx={{
              height: "calc(100% - 72px)",
              backgroundColor: "background.paper",
            }}
          >
            <Box
              sx={{
                p: 3,
                pt: 1,
                pb: 1,
                width: "100%",
                height: "100%",
                borderRadius: 0,
                backgroundColor: "background.paper",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  overflowY: "auto",
                  backgroundColor: "background.default",
                  borderRadius: 1,
                }}
              >
                {children}
              </Box>
            </Box>
          </Box>
        </Box>
      </BreadCrumbsProvider>
    </Box>
  );
};
export default SideMenuDrawer;
