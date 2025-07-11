"use client";

import { Box, Grid } from "@mui/material";
import RegisterForm from "@/src/auth/register/form";
import Image from "next/image";

export default function RegisterPageContent() {
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
      {/* Left side - Background Image */}
      <Grid
        size={{ xs: 12, md: 4 }}
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[50]
              : theme.palette.grey[900],
          position: "relative", // ← IMPORTANTE: Necessário para fill
          display: { xs: "none", md: "block" }, // ← Opcional: esconder no mobile
        }}
      >
        <Image
          src={"/images/background16-9.png"}
          alt="Register Background"
          fill // ← Nova API
          style={{ objectFit: "cover" }} // ← Use style
          priority // ← Para imagens importantes
          onLoad={() => console.log("✅ Register image loaded successfully")}
          onError={(e) => console.error("❌ Error loading register image:", e)}
        />

        {/* Overlay opcional para melhor contraste */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))",
            zIndex: 1,
          }}
        />
      </Grid>

      {/* Right side - Register Form */}
      <Grid
        size={{ xs: 12, md: 8 }}
        component={Box}
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={4}
        sx={{
          backgroundColor: "background.default",
          minHeight: { xs: "100vh", md: "auto" }, // ← Full height no mobile
        }}
      >
        <Box
          sx={{
            width: "100%",
            mx: "auto",
          }}
        >
          <RegisterForm />
        </Box>
      </Grid>
    </Grid>
  );
}
