import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { use } from "react";

export default async function PublicRetreatInfo({ retreat }: { retreat: any }) {
  const retreatLoaded = use(retreat);
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12 }}>
        <Chip label={`Retreat ID: ${retreatLoaded.id}`} />
      </Grid>
    </Grid>
  );
}
