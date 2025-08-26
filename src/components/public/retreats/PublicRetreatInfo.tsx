import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { Box, Button, Typography } from "@mui/material";
import { Status, StatusChip } from "../../chip/StatusChip";
import { ImageCarrousel } from "./image-carrousel";
import { redirect } from "next/navigation"; // <== adicionado

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
  // const retreatLoaded = await fetchPublicRetreat(retreatId);
  const retreatLoaded = {
    id: 1,
    title: "Retiro de Verão 2025",
    edition: 1,
    state: "São Paulo",
    stateShort: "SP",
    city: "Campinas",
    theme: "Renovação Espiritual",
    description:
      "Um retiro especial de verão para renovação espiritual e convivência.",
    startDate: "2025-01-10",
    endDate: "2025-01-20",
    capacity: 50,
    participationTax: "R$ 300",
    enrolled: 45,
    location: "Sítio Esperança",
    isActive: false,
    images: [
      "/images/retreats/retreat-1.jpg",
      "/images/retreats/retreat-2.jpg",
      "/images/retreats/retreat-3.jpg",
      "/images/retreats/retreat-1.jpg",
      "/images/retreats/retreat-2.jpg",
      "/images/retreats/retreat-3.jpg",
      "/images/retreats/retreat-1.jpg",
      "/images/retreats/retreat-2.jpg",
      "/images/retreats/retreat-3.jpg",
      "/images/retreats/retreat-1.jpg",
      "/images/retreats/retreat-2.jpg",
      "/images/retreats/retreat-3.jpg",
      "/images/retreats/retreat-1.jpg",
      "/images/retreats/retreat-2.jpg",
      "/images/retreats/retreat-3.jpg",
    ],
    status: "open",
    instructor: "Pe. João",
  };
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
    <Box sx={{ m: 2 }}>
      <Grid maxWidth={"lg"} container spacing={2} sx={{ mt: 1, m: "auto" }}>
        <Grid size={{ xs: 12 }}>
          <StatusChip
            sx={{ minWidth: 100 }}
            status={retreatLoaded.status as Status}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h3">{retreatLoaded.title}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2">{retreatLoaded.description}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ImageCarrousel images={retreatLoaded.images} aspectRatio={16 / 9} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              minWidth: 200,
              maxWidth: "30%",
              borderRadius: 2,
              borderColor: "divider",
              borderWidth: 1,
              borderStyle: "solid",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 50,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                p: 2,
                m: 2,
              }}
            >
              <Typography variant="h5">👨</Typography>
            </Box>
            <Box>
              <Typography variant="h5">Anunciante</Typography>
              <Typography variant="h4">{retreatLoaded.instructor}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="h5">Descrição</Typography>
            <Typography variant="body1">{retreatLoaded.description}</Typography>
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12 }}
          sx={{
            position: "sticky",
            bottom: 10,
            zIndex: 1000,
          }}
        >
          <form
            action={async () => {
              "use server";
              redirect(`/public/retreats/${retreatId}/register`); // <== substitui window.*
            }}
          >
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained" color="primary">
                Preencher Inscrição.
              </Button>
            </Box>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
}
