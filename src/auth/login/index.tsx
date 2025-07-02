"use client";
import { Box, Grid } from "@mui/material";
import LoginForm from "@/src/auth/login/form";

export default function LoginPageContent() {
  //const theme = useTheme();

  return (
    <Grid
      container
      spacing={0}
      component="main"
      sx={{
        height: "100vh",
        borderColor: "background.default",
        borderWidth: 4,
        borderStyle: "solid",
      }}
    >
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          backgroundImage: "url(/background16:9.png)",
          backgroundRepeat: "no-repeat",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[50]
              : theme.palette.grey[900],
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid
        size={{ xs: 12, md: 6 }}
        component={Box}
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <LoginForm />
      </Grid>
    </Grid>
  );
}
