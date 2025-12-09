import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { Box, Typography } from "@mui/material";
import { Status, StatusChip } from "../../chip/StatusChip";
import { ImageCarrousel } from "./image-carrousel";
import { Retreat } from "@/src/types/retreats";
import { PublicRetreatRegistrationActions } from "./PublicRetreatRegistrationActions";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default async function PublicRetreatInfo({
  retreatId,
}: {
  retreatId: string;
}) {
  try {
    const response = await fetch(`${BACKEND_URL}/Retreats/${retreatId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Erro HTTP ${response.status}: ${response.statusText}`,
        await response.text()
      );
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const retreatLoaded = (await response.json()) as Retreat;
    console.warn("Retreat data loaded:", retreatId, retreatLoaded);

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
            <Typography variant="h3">{retreatLoaded.name}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2">{retreatLoaded.description}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ImageCarrousel
              images={retreatLoaded.images ?? []}
              aspectRatio={16 / 9}
            />
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
              <Typography variant="body1">
                {retreatLoaded.description}
              </Typography>
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
            <PublicRetreatRegistrationActions retreatId={retreatId} />
          </Grid>
        </Grid>
      </Box>
    );
  } catch (error) {
    console.error("Erro ao carregar retiro:", error);
    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Chip color="error" label="Falha ao carregar retiro" />
        </Grid>
      </Grid>
    );
  }
}
