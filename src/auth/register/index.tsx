"use client";
import { Box, Grid } from "@mui/material";
import RegisterForm from "./form";

export default function RegisterPageContent() {
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
        size={{ xs: 12, md: 4 }}
        sx={{
          backgroundImage: "url(/logo16:9.png)",
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
        size={{ xs: 12, md: 8 }}
        component={Box}
        display="flex"
        justifyContent="center"
        //alignItems="center"
        marginTop={4}
        padding={4}
      >
        <RegisterForm />
      </Grid>
    </Grid>
  );
}
