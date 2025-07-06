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
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/src/lib/axiosClientInstance";
import useSWR from "swr";
// import { logout } from "@/src/actions/logout";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const t = createTranslator({ locale: "pt", messages: ptMessages });
  const session = useSession();
  const handleLogout = async () => {
    try {
      signOut().then(() => {
        router.push("/login");
      });
      // if (result.success && result.redirectTo) {
      //   router.push(result.redirectTo);
      //   router.refresh();
      // }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const { isLoading } = useSWR(
    "/user",
    async () => {
      const response = await api.get("/user");
      return response.data;
    },
    {
      onError: (err) => {
        setError("Erro ao buscar usuário");
        console.error("Erro ao buscar usuário:", err);
      },
      onSuccess: (data) => {
        setUser(data);
      },
    }
  );

  if (isLoading) {
    return <div>Carregando...</div>;
  }

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
            Você já está logado {user?.name}, {session?.status}
          </Typography>
          <Typography component="p" variant="body2" color="textSecondary">
            {error ? error : `Email: ${user?.email}`}
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
