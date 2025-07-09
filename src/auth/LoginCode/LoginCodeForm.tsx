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
import { useForm } from "react-hook-form";
// import { ErrorMessage } from "@hookform/error-message";
import { useSession } from "next-auth/react";
// import { useSession } from "next-auth/react";
// -- ADICIONADO: Imports do Zod e seu Resolver
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { OtpInput } from "@/src/components/otp/OtpInput";

// -- ADICIONADO: Definição do schema de validação Zod
const loginCodeSchema = z.object({
  code: z
    .string()
    .min(6, "O código deve ter no mínimo 6 caracteres")
    .max(6, "O código deve ter no máximo 6 caracteres"),
});
type LoginCodeSchema = z.infer<typeof loginCodeSchema>; // Tipo derivado do schema

export default function LoginCodeForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginCodeSchema>({
    resolver: zodResolver(loginCodeSchema),
  });
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  //const { status } = useSession();
  const session = useSession();
  const [otp, setOtp] = useState<string>(""); // Estado para o código OTP
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data: { code: string }) => {
    setLoading(true);
    if (session.status === "loading") return null;

    // startTransition(() => {
    //   console.log(callbackUrl, "Callback URL from login form");
    //   login(data, callbackUrl)
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     .then((data: any) => {
    //       console.log(data, "Data from login");
    //       if (data?.error) {
    //         reset();
    //         setError(data.error);
    //         setLoading(false);
    //       }
    //       if (data?.success) {
    //         setSuccess(data.success);
    //         setError("");
    //       }
    //       setLoading(false);
    //     })
    //     .catch(() => setError("Something went wrong"));
    // });
  };

  // if (session.status === "authenticated") {
  //   return (
  //     <Paper elevation={0} sx={{ width: "100%", padding: 4, borderRadius: 2 }}>
  //       <Box sx={{ display: "flex", justifyContent: "center" }}>
  //         <Typography>Redirecionando...</Typography>
  //       </Box>
  //     </Paper>
  //   );
  // }
  console.log(session, "Session from login form");
  return (
    <Paper elevation={1} sx={{ width: "100%", padding: 4, borderRadius: 2 }}>
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
          Insira o código de verificação
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          Um código de verificação foi enviado junto ao seu convite. Por favor,
          insira o código abaixo para continuar.
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <Typography>{session?.status}</Typography>
          <OtpInput
            length={6}
            onChange={(e) => setOtp(e)}
            error={!!errors.code}
          />
          {errors.code && (
            <Typography color="error">{errors.code.message}</Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2, padding: 1.5 }}
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
              <FormError message={error} />
              <FormSuccess message={success} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
