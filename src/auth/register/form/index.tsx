"use client";
import React, { useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OtpInput } from "@/src/components/otp/OtpInput";
import OtpWrapper from "@/src/components/otp/OtpWrapper";

// Define the Zod schema for validation
const registerSchema = z
  .object({
    code: z
      .string()
      .length(6, "O código deve ter exatamente 9 caracteres alfanuméricos")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "O código deve conter apenas caracteres alfanuméricos"
      ),
    email: z.string().email("Informe um email válido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A confirmação de senha deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // Path to highlight the error
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  //const router = useRouter();
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [otp, setOtp] = useState<string>(""); // State for OTP code

  const onSubmit = async (data: RegisterSchema) => {
    setLoading(true);

    try {
      // Simulate API call for registration
      console.log("Registration data:", data);

      // Redirect to dashboard or login page after successful registration
      //router.push("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      setError("email", {
        type: "manual",
        message: "Ocorreu um erro ao tentar registrar. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
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
        </Box>
      </Box>
    </Paper>
  );
}
