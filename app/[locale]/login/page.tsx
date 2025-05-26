"use client";
import React, { useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  CssBaseline,
  Paper,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { FieldValues, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { signIn, signOut, useSession } from "next-auth/react";
//import { useRouter } from "next/navigation";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();
  const { data: session, status } = useSession();
  //const router = useRouter();
  //const { status } = useSession();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FieldValues) => {
    setLoading(true);
    try {
      if (status === "loading") return null;
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (res?.error) {
        console.error(res.error);
        setLoading(false);
        return;
      } else {
        setLoading(false);
        //router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError("loginError", {
        type: "manual",
        message: "An error occurred during login",
      });
      setLoading(false);
    }
  };

  if (session) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
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
    );
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
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
            Entrar
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de Email"
              autoComplete="email"
              autoFocus
              {...register("email", { required: true })}
              //onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Lembrar-me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
              loading={loading}
              loadingPosition="start"
              startIcon={
                loading ? (
                  <Icon icon="material-symbols:hourglass-top" />
                ) : (
                  <Icon icon="material-symbols:lock-outline" />
                )
              }
              disabled={loading}
            >
              Entrar
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Esqueceu a senha?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Não tem conta? Cadastre-se"}
                </Link>
              </Grid>
              {errors.exampleRequired && <span>This field is required</span>}
            </Grid>
            <ErrorMessage
              errors={errors}
              name="singleErrorInput"
              render={({ message }) => <p>{message}</p>}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
