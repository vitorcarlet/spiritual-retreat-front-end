// import { auth } from "auth";
// import getServerSession from "next-auth";
"use client";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import TopBar from "@/src/components/navigation/TopBar";
import MenuNav from "@/src/components/navigation/Menu";
import { useState } from "react";
import { ResponsiveDrawer } from "@/src/components/navigation/Menu/ResponsiveDrawer";

export default function Page({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* TopBar */}
      <TopBar />

      {/* Conteúdo abaixo */}
      <Box sx={{ display: "flex", flexGrow: 1, transition: "all 0.3s ease" }}>
        {/* Menu lateral (Drawer no mobile) */}
        {isMobile ? (
          <ResponsiveDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <MenuNav />
          </ResponsiveDrawer>
        ) : (
          <Box
            sx={{
              width: 240,
              transition: "width 0.3s ease",
              borderRight: "1px solid #ddd",
            }}
          >
            Menu
          </Box>
        )}

        {/* Conteúdo principal */}
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            transition: "margin 0.3s ease",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

// export async function getServerSideProps(context: any) {
//   return {
//     props: {
//       session: await getServerSession(context.req, context.res, authOptions),
//     },
//   };
// }
