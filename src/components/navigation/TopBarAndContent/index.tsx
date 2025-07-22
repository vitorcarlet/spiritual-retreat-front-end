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
          display: "grid",
          gridTemplateAreas: `"topbar" "content"`,
          gridTemplateRows: "auto 1fr",
          height: "100vh",
          //overflow: "hidden",
          //paddingBottom: 2,
        }}
      >
        <Box sx={{ gridArea: "topbar", backgroundColor: "background.paper" }}>
          <TopBar />
        </Box>

        <Box
          sx={{
            gridArea: "content",
            //overflow: "auto",
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
