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
  Paper,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { FieldValues, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { redirect, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
// import { useSession } from "next-auth/react";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  //const { status } = useSession();
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data: FieldValues) => {
    setLoading(true);
    if (status === "loading") return null;

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    console.log("SignIn Response:", res);

    setLoading(false);

    if (res?.ok) {
      console.log("Login successful:", res);
      router.push("/dashboard"); // Redirect to dashboard
    } else {
      console.error("Login failed:", res?.error);
      setError("loginError", {
        type: "manual",
        message: res?.error || "An error occurred during login",
      });
    }
  };

  if (session.status == "authenticated") return redirect("/dashboard");

  // if (session?.user) {
  //   return (
  //     <Container component="main" maxWidth="xs">
  //       <CssBaseline />
  //       <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
  //         <Box
  //           sx={{
  //             display: "flex",
  //             flexDirection: "column",
  //             alignItems: "center",
  //           }}
  //         >
  //           <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
  //             <Icon icon="material-symbols:lock-outline" />
  //           </Avatar>
  //           <Typography component="h1" variant="h5">
  //             Você já está logado
  //           </Typography>
  //           <Button
  //             type="submit"
  //             fullWidth
  //             variant="contained"
  //             sx={{ mt: 2, mb: 2 }}
  //             onClick={() => signOut()}
  //           >
  //             Sair
  //           </Button>
  //         </Box>
  //       </Paper>
  //     </Container>
  //   );
  // }
  return (
    <Container component="main" maxWidth="xs">
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
            <Typography>{session?.status}</Typography>
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
              <Grid size={{ xs: 12 }}>
                <Link href="#" variant="body2">
                  Esqueceu a senha?
                </Link>
              </Grid>
              <Grid size={{ xs: 12 }}>
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
