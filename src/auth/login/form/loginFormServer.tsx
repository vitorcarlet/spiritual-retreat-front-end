// src/auth/login/form/index.tsx
'use client';

import React, { useActionState } from 'react';

import {
  Avatar,
  Box,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { loginServerAction } from '@/src/actions/login-server';

import { FormError } from '../../FormError';
import { SubmitButton } from './SubmitButton';

type LoginState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const initialState: LoginState = {
  message: '',
  errors: {},
};

// Wrapper para adaptar assinatura (prevState, formData)
async function loginActionWrapper(prevState: LoginState, formData: FormData) {
  // Reutiliza a action existente (mantendo compatibilidade)
  const result = await loginServerAction(formData);
  // Se loginServerAction fez redirect, execução não continua.
  if (result && 'errors' in result) {
    return result as LoginState;
  }
  return { message: '', errors: {} }; // sucesso (redirect já ocorreu)
}

export default function LoginFormServer() {
  const [state, formAction] = useActionState(loginActionWrapper, initialState);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        p: 4,
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
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }} />
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
            control={<Checkbox name="remember" value="yes" color="primary" />}
            label="Lembrar-me"
          />

          <SubmitButton />

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link href="/forgotpassword" variant="body2">
              Esqueceu a senha?
            </Link>
          </Box>

          {state?.message && <FormError message={state.message} />}
        </Box>
      </Box>
    </Paper>
  );
}
