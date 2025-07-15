import SideMenu from "@/src/components/navigation/Menu";
import TopBar from "@/src/components/navigation/TopBar";
import { Box } from "@mui/material";

export const metadata = {
  title: "Protected Routes",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  <Box >
    <SideMenu />
    <Box>

        <TopBar />
      
      <Box  sx={{
            flexGrow: 1,
            p: 2,
            transition: "margin 0.3s ease",
          }}>{children}</Box>
    </Box>
  </Box>
  return ;
}
