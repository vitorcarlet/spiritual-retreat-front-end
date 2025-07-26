import { Box } from "@mui/material";
import dynamic from "next/dynamic";
const UserDataTable = dynamic(
  () => import("@/src/components/table/UserDataTable")
);
export default function Page() {
  return (
    <Box sx={{ width: "100%", height: "100%", padding: 2, overflow: "auto" }}>
      <UserDataTable />
    </Box>
  );
}
