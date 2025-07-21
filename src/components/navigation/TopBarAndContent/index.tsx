import { Box } from "@mui/material";
import TopBar from "../TopBar";
import ProtectedRoute from "../protected/ProtectedRoute";
import { BreadCrumbsProvider } from "@/src/contexts/BreadCrumbsContext";

export default function TopBarAndContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BreadCrumbsProvider>
      <Box sx={{ gridArea: "topbar", backgroundColor: "background.paper" }}>
        <TopBar />
      </Box>
      <Box
        sx={{
          gridArea: "content",
          overflow: "auto",
          backgroundColor: "background.paper",
          p: 2,
        }}
      >
        <Box
          sx={{
            width: "100%", // ✅ Agora funciona perfeitamente
            borderRadius: 4,
            backgroundColor: "background.default",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </Box>
    </BreadCrumbsProvider>
  );
}
