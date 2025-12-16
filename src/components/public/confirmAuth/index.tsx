'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

import { Alert, Button, TextField } from '@mui/material';

import { ROUTES } from '@/routes';
import { LoginResponse } from '@/src/auth/types';

//min 6 characters, min 1 nummber, 1 special character and one uppercase letter
const schema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword '],
  });

type FormData = z.infer<typeof schema>;

export default function ConfirmAuth({ token }: { token: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: token,
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: data.password,
          token: data.token,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to confirm account');
      }
      //add the response in the next-auth session
      const result: LoginResponse = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Falha ao confirmar a conta');
      }

      if (!result.user?.email) {
        throw new Error('Email do usuário não retornado pelo servidor');
      }

      const signInResult = await signIn('confirmCode', {
        redirect: false,
        result,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      redirect(ROUTES.PROTECTED.DASHBOARD);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro desconhecido ao confirmar'
      );
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        type="password"
        label="Password"
        placeholder="Password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <TextField
        type="password"
        label="Confirm Password"
        placeholder="Confirm Password"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <Button type="submit" variant="contained" />
      {errorMessage && (
        <Alert sx={{ mt: 2 }} severity="error">
          {errorMessage}
        </Alert>
      )}
    </form>
  );
}
