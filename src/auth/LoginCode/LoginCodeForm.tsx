"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Box, Paper, Typography, Grid, Button } from "@mui/material";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { OtpInput } from "@/src/components/otp/OtpInput";

const loginCodeSchema = z.object({
  code: z.string().length(6, "O código deve ter 6 dígitos"),
});
type LoginCodeSchema = z.infer<typeof loginCodeSchema>;

export default function LoginCodeForm() {
  const {
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    register,
  } = useForm<LoginCodeSchema>({
    resolver: zodResolver(loginCodeSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });

  // Needed so RHF knows about the field (hidden)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _reg = register("code");

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { status } = useSession();

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [successMsg, setSuccessMsg] = useState<string | undefined>();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const onSubmit = async (data: LoginCodeSchema) => {
    if (status === "authenticated") return;
    setSubmitting(true);
    setErrorMsg(undefined);
    setSuccessMsg(undefined);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        code: data.code,
      });

      if (res?.error) {
        // Custom messages based on identifiers if backend sets them
        if (res.error.includes("INVALID_CODE")) {
          setErrorMsg("Código inválido.");
        } else if (res.error.includes("EXPIRED_CODE")) {
          setErrorMsg("Código expirado. Solicite outro.");
        } else {
          setErrorMsg("Não foi possível validar o código.");
        }
      } else {
        setSuccessMsg("Código verificado. Redirecionando...");
        router.replace(callbackUrl);
      }
    } catch {
      setErrorMsg("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentCode = watch("code");

  return (
    <Paper elevation={1} sx={{ width: "100%", p: 4, borderRadius: 2 }}>
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
        <Typography variant="body2" sx={{ mt: 1, mb: 2, textAlign: "center" }}>
          Enviamos (ou foi fornecido) um código de verificação. Digite para
          continuar.
        </Typography>

        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 1, textAlign: "center" }}
        >
          <OtpInput
            length={6}
            onChange={(val) => setValue("code", val, { shouldValidate: true })}
            error={errors.code}
            disabled={submitting}
          />

          {errors.code && (
            <Typography
              variant="caption"
              color="error"
              sx={{ display: "block", mt: 1 }}
            >
              {errors.code.message}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.4 }}
            loading={submitting}
            loadingPosition="start"
            startIcon={<Icon icon="material-symbols:lock-outline" />}
            disabled={currentCode.length !== 6 || submitting}
          >
            Validar código
          </Button>

          <Grid container>
            <Grid size={12}>
              <FormError message={errorMsg} />
              <FormSuccess message={successMsg} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
