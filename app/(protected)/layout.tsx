import SideMenu from "@/src/components/navigation/SideMenu";
import TopBar from "@/src/components/navigation/TopBar";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Box } from "@mui/material";

export const metadata = {
  title: "Protected Routes",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box display={"flex"} sx={{ height: "100vh" }}>
      <SideMenu />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.paper",
        }}
      >
        <TopBar />
        <Box
          sx={{
            flexGrow: 1,
            mt: 2,
            ml: 3,
            mr: 3,
            mb: 2,
            overflowY: "auto",
            p: 0,
            borderRadius: 4,
            backgroundColor: "background.default",
            transition: "margin 0.3s ease",
          }}
        >
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </Box>
    </Box>
  );
}
