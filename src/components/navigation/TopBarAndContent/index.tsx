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
      <Box
        sx={{
          height: "100vh",
          flexGrow: 1,
        }}
      >
        <Box sx={{ backgroundColor: "background.paper" }}>
          <TopBar />
        </Box>

        <Box
          sx={{
            backgroundColor: "background.paper",
            p: 2,
            width: "100%", // ✅ Agora funciona perfeitamente
            maxHeight: "100%",
          }}
        >
          <ProtectedRoute>{children}</ProtectedRoute>
        </Box>
      </Box>
    </BreadCrumbsProvider>
  );
}
