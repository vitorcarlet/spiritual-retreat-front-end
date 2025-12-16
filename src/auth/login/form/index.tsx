'use client';
import React, { startTransition, useState } from 'react';
import { useForm } from 'react-hook-form';

// import { ErrorMessage } from "@hookform/error-message";
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
// import { useSession } from "next-auth/react";
// -- ADICIONADO: Imports do Zod e seu Resolver
import { z } from 'zod';

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { login } from '@/src/actions/login';

import { FormError } from '../../FormError';
import { FormSuccess } from '../../FormSuccess';

// -- ADICIONADO: Definição do schema de validação Zod
const loginSchema = z.object({
  email: z.string().email('Informe um email válido'),
  password: z.string().min(3, 'A senha deve ter no mínimo 3 caracteres'),
});
type LoginSchema = z.infer<typeof loginSchema>; // Tipo derivado do schema

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  //const { status } = useSession();
  const session = useSession();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    startTransition(() => {
      login(data, callbackUrl)
        .then((data: any) => {
          if (data?.error) {
            reset();
            setError(data.error);
            setLoading(false);
          }
          if (data?.success) {
            setSuccess(data.success);
            setError('');
          }
          setLoading(false);
        })
        .catch(() => setError('Something went wrong'));
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        padding: 4,
        borderRadius: 2,
        boxShadow: (theme) => `0px 4px 12px ${theme.palette.primary.main}80`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <Icon icon="material-symbols:lock-outline" />
        </Avatar>
        <Typography component="h1" variant="h5">
          Entrar
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <Typography>{session?.status}</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            autoComplete="email"
            autoFocus
            {...register('email', { required: true })}
            //onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <Typography color="error">{errors.email.message}</Typography>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password', { required: true })}
          />
          {errors.password && (
            <Typography color="error">{errors.password.message}</Typography>
          )}
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Lembrar-me"
          />
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
              <Link href="/forgotpassword" variant="body2">
                Esqueceu a senha?
              </Link>
            </Grid>
            <Grid size={{ xs: 12 }}></Grid>
            {errors.root && (
              <Typography color="error" sx={{ mt: 2 }}>
                {errors.root?.message ||
                  'Ocorreu um erro ao tentar fazer login. Verifique suas credenciais e tente novamente.'}
              </Typography>
            )}
            <FormError message={error} />
            <FormSuccess message={success} />
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
