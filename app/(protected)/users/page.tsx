import { Box } from "@mui/material";
import dynamic from "next/dynamic";
const DataTableExample = dynamic(
  () => import("@/src/components/table/DataTableExample")
);
export default function Page() {
  return (
    <Box sx={{ width: "100%", height: "100%", padding: 2, overflow: "auto" }}>
      <DataTableExample />
    </Box>
  );
}
