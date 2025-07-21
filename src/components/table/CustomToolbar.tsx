import { DataGrid, Toolbar } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { useState } from "react";

function CustomToolbar({
  setDensity,
}: {
  setDensity: (density: "compact" | "standard" | "comfortable") => void;
}) {
  return (
    <Toolbar>
      <Button onClick={() => setDensity("compact")}>Compact</Button>
      <Button onClick={() => setDensity("standard")}>Standard</Button>
      <Button onClick={() => setDensity("comfortable")}>Comfortable</Button>
    </Toolbar>
  );
}

export default function TableWithDensityControl() {
  const [density, setDensity] = useState<
    "compact" | "standard" | "comfortable"
  >("standard");

  return (
    <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={[{ id: 1, name: "User" }]}
        columns={[
          { field: "id", width: 90 },
          { field: "name", width: 150 },
        ]}
        density={density}
        slots={{
          toolbar: () => <CustomToolbar setDensity={setDensity} />,
        }}
      />
    </div>
  );
}
