import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { Box, Button, Typography } from "@mui/material";
import { Status, StatusChip } from "../../chip/StatusChip";
import { ImageCarrousel } from "./image-carrousel";
import { redirect } from "next/navigation";
import { Retreat } from "@/src/types/retreats";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
            <form
              action={async (formData: FormData) => {
                "use server";
                const actionType = formData.get("action");
                if (actionType === "participate") {
                  redirect(
                    `/public/retreats/${retreatId}/register/participate`
                  );
                } else if (actionType === "serve") {
                  redirect(`/public/retreats/${retreatId}/register/serve`);
                }
              }}
            >
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  name="action"
                  value="participate"
                  variant="contained"
                  color="primary"
                >
                  Preencher Inscrição Participar.
                </Button>
                <Button
                  type="submit"
                  name="action"
                  value="serve"
                  variant="contained"
                  color="primary"
                >
                  Preencher Inscrição Servir.
                </Button>
              </Box>
            </form>
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
