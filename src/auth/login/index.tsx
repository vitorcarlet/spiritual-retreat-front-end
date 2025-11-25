"use client";
import { Box, Grid } from "@mui/material";
import Image from "next/image";
import LoginFormServer from "./form/loginFormServer";

export default function LoginPageContent() {
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
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[50]
              : theme.palette.grey[900],
          position: "relative",
        }}
      >
        <Image
          src={"/images/background16-9.png"}
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          priority
          onError={(e) => console.error("❌ Erro ao carregar imagem:", e)}
        />
      </Grid>
      <Grid
        size={{ xs: 12, md: 6 }}
        component={Box}
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <LoginFormServer />
      </Grid>
    </Grid>
  );
}
