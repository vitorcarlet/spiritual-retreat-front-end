import { Retreat } from "@/src/types/retreats";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
//import { use } from "react";
import { fetchPublicRetreat } from "./shared";

//const retreatCache = new Map<string, Promise<Retreat | null>>();

export default async function PublicRetreatInfo({
  retreatId,
}: {
  retreatId: string;
}) {
  // const getRetreatData = (retreatId: string) => {
  //   if (!retreatCache.has(retreatId)) {
  //     retreatCache.set(retreatId, fetchPublicRetreat(retreatId));
  //   }
  //   return retreatCache.get(retreatId)!;
  // };
  // const retreatPromise = getRetreatData(retreatId);
  // const retreatLoaded = use(retreatPromise);
  const retreatLoaded = await fetchPublicRetreat(retreatId);
  // const retreatLoaded = await fetch(
  //   "http://localhost:3001/api/public/retreats/" + retreatId
  // )
  //   .then((res) => res.json())
  //   .then((data) => data as Retreat);
  console.log("Retreat data loaded:", retreatId, retreatLoaded);

  if (!retreatLoaded) {
    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Chip color="error" label="Falha ao carregar retiro" />
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12 }}>
        <Chip
          color={retreatLoaded.status === "open" ? "success" : "warning"}
          label={`Retreat ID: ${retreatLoaded?.status}`}
        />
      </Grid>
    </Grid>
  );
}
