// app/(protected)/ProtectedLayoutContent.tsx
"use client";

import { Box } from "@mui/material";
import SideMenu from "@/src/components/navigation/SideMenu";
import TopBarAndContent from "../TopBarAndContent";

export default function ProtectedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <SideMenu />
      {/* TopBar */}
      <TopBarAndContent>{children}</TopBarAndContent>
    </Box>
  );
}
