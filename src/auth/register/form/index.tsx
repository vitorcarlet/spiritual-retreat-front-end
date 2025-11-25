"use client";
import React, { startTransition, useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
  Link,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpInput } from "@/src/components/otp/OtpInput";
import OtpWrapper from "@/src/components/otp/OtpWrapper";
import { FormSuccess } from "../../FormSuccess";
import { FormError } from "../../FormError";
import { registerForm } from "@/src/actions/register";
import { RegisterSchema, registerSchema } from "@/src/schemas";

// Define the Zod schema for validation

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    //setError,
    control,
    reset,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");

  const onSubmit = async (data: RegisterSchema) => {
    setLoading(true);

    startTransition(() => {
      registerForm(data)
        .then((data: any) => {
          if (data?.error) {
            reset();
            setErrorMessage(data.error);
            setLoading(false);
          }
          if (data?.success) {
            setSuccess(data.success);
            setErrorMessage("");
          }
          setLoading(false);
        })
        .catch(() => setErrorMessage("Something went wrong"))
        .finally(() => {
          setLoading(false);
        });
    });
  };

  return (
    <Paper elevation={0} sx={{ width: "100%", padding: 4, borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <Icon icon="material-symbols:person-add-outline" />
        </Avatar>
        <Typography component="h1" variant="h5">
          Registrar
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <OtpWrapper
            error={errors.code}
            label="Código de Verificação"
            //error={!!error}
            helperText={"Digite o código de 6 dígitos para verificar sua conta"}
            required
            // focused={true} // Controle manual do foco (opcional)
          >
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <OtpInput
                  length={6}
                  onChange={field.onChange}
                  error={fieldState.error}
                />
              )}
            />
          </OtpWrapper>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            autoComplete="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            id="password"
            autoComplete="new-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirmar Senha"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2, padding: 1.5 }}
            disabled={loading}
            startIcon={
              loading ? (
                <Icon icon="material-symbols:hourglass-top" />
              ) : (
                <Icon icon="material-symbols:person-add-outline" />
              )
            }
          >
            {loading ? "Registrando..." : "Registrar"}
          </Button>
          <Grid container>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                Já tem uma conta? <Link href="/login">Entrar</Link>
              </Typography>
            </Grid>
          </Grid>
          <Grid>
            <Typography variant="body2">
              Ao se registrar, você concorda com nossos{" "}
              <Link href="/terms">Termos de Serviço</Link> e{" "}
              <Link href="/privacy">Política de Privacidade</Link>.
            </Typography>
          </Grid>
          <FormError message={errorMessage} />
          <FormSuccess message={success} />
        </Box>
      </Box>
    </Paper>
  );
}
