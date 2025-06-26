"use client";
import {
  Container,
  Paper,
  Box,
  Avatar,
  Typography,
  Button,
} from "@mui/material";
import { signOut } from "next-auth/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("common");
  return (
    <Container component="main" maxWidth="xs">
      <button>{t("tire")}</button>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <Icon icon="material-symbols:lock-outline" />
          </Avatar>
          <Typography component="h1" variant="h5">
            Você já está logado
          </Typography>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
            onClick={() => signOut()}
          >
            Sair
          </Button>
        </Box>
      </Paper>
    </Container>
  ); // Add to Cart
}
