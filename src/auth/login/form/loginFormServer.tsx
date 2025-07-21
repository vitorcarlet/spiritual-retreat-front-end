// src/auth/login/form/index.tsx
import React, { useActionState } from "react";
import {
  Avatar,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { loginServerAction } from "@/src/actions/login-server";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "../../FormError";

const initialState = {
  message: "",
  errors: {},
};

export default function LoginFormServer() {
  const [state, formAction] = useActionState(loginServerAction, initialState);

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        padding: 4,
        borderRadius: 2,
        boxShadow: (theme) => `0px 4px 12px ${theme.palette.primary.main}80`,
      }}
    >
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

        <Box component="form" action={formAction} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            name="email"
            label="Endereço de Email"
            autoComplete="email"
            autoFocus
            error={!!state?.errors?.email}
            helperText={state?.errors?.email?.[0]}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            error={!!state?.errors?.password}
            helperText={state?.errors?.password?.[0]}
          />

          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Lembrar-me"
          />

          {/* ✅ Botão com useFormStatus */}
          <SubmitButton />

          <Grid container>
            <Grid size={{ xs: 12 }}>
              <Link href="/forgotpassword" variant="body2">
                Esqueceu a senha?
              </Link>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Link href="/register" variant="body2">
                {"Não tem conta? Cadastre-se"}
              </Link>
            </Grid>

            {/* ✅ Mostrar mensagens de erro/sucesso */}
            {state?.message && <FormError message={state.message} />}
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
