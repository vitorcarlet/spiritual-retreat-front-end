// app/(protected)/ProtectedLayoutContent.tsx
"use client";

import { Box } from "@mui/material";
import SideMenu from "@/src/components/navigation/SideMenu";
import { useDrawer } from "@/src/contexts/DrawerContext";
import TopBarAndContent from "../TopBarAndContent";

export default function ProtectedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDrawerOpen, drawerWidth } = useDrawer();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "grid",
        // ✅ Grid template que se adapta ao drawer
        gridTemplateColumns: isDrawerOpen ? `${drawerWidth}px 1fr` : `0px 1fr`,
        gridTemplateRows: "auto 1fr",
        gridTemplateAreas: isDrawerOpen
          ? `"sidebar topbar"
             "sidebar content"`
          : `". topbar"
             ". content"`,
        transition: "grid-template-columns 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Box sx={{ gridArea: "sidebar", overflow: "hidden" }}>
        <SideMenu />
      </Box>

      {/* TopBar */}

      <TopBarAndContent>{children}</TopBarAndContent>
    </Box>
  );
}
