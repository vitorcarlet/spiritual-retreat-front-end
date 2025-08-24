import { IconButton, Paper, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Iconify from "@/src/components/Iconify";
import Breadcrumbs from "./Breadcrumbs";
import { useDrawer } from "@/src/contexts/DrawerContext";

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
        {/* Left side - Menu toggle */}
        <Grid
          size={{ xs: 12, md: 8, lg: 6 }}
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

          {/* Center - Breadcrumbs */}
          {/* <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "start",
              minHeight: 32,
            }}
          >
            <Breadcrumbs />
          </Box> */}
        </Grid>
        {/* Right side - User actions */}
      </Grid>
    </Paper>
  );
};

export default TopBar;
