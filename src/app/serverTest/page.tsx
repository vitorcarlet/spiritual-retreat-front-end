"use client";
import {
  Container,
  Paper,
  Box,
  Avatar,
  Typography,
  Button,
} from "@mui/material";

import { Icon } from "@iconify/react/dist/iconify.js";
// import { auth } from "auth";
// import getServerSession from "next-auth";
import { createTranslator } from "next-intl";
import ptMessages from "messages/pt-br.json";
import { signOut } from "next-auth/react";
import { logout } from "@/src/actions/logout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/src/lib/axiosInstance";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const t = createTranslator({ locale: "pt", messages: ptMessages });
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const result = await logout();

      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  useEffect(() => {
    api
      .get("/user")
      .then((res) => setUser(res.data))
      .catch(() => setError("Erro ao buscar usuário"));
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <button>{t("HomePage.title")}</button>
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
            onClick={() => handleLogout()}
          >
            Sair
          </Button>
        </Box>
      </Paper>
    </Container>
  ); // Add to Cart
}
