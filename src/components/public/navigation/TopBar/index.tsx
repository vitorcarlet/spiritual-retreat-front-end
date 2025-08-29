import { IconButton, Paper, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";
import Iconify from "@/src/components/Iconify";
import { useDrawer } from "@/src/contexts/DrawerContext";
import Link from "next/link";

const TopBar = () => {
  const { handleDrawerToggle, handleDrawerPersistentToggle } = useDrawer();
  const theme = useTheme();
  const isXsUp = theme.breakpoints.up("xs");
  return (
    <Paper
      elevation={0}
      sx={{
        borderBottom: 0,
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: "appBar",
        borderRadius: "0",
        boxShadow: "none",
      }}
    >
      <Grid container sx={{ px: 2, minHeight: 72 }}>
        <Grid
          size={{ xs: 4 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
          gap={2}
        >
          <IconButton
            onClick={isXsUp ? handleDrawerPersistentToggle : handleDrawerToggle}
            aria-label="Toggle menu"
            size="medium"
          >
            <Iconify icon="lucide:menu" size={2.5} />
          </IconButton>
        </Grid>
        <Grid
          size={{ xs: 8 }}
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          <Typography component="span" variant="body2" sx={{ marginRight: 2 }}>
            Já foi contemplado?{" "}
            <Typography
              component={Link}
              variant="body2"
              color="primary"
              fontWeight="bold"
              sx={{ textDecoration: "underline", cursor: "pointer" }}
              href="/login"
            >
              Acesse aqui!
            </Typography>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TopBar;
