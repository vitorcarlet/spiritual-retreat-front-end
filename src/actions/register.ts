'use server';

import { redirect } from 'next/navigation';

import { ROUTES } from '@/routes';
import { RegisterSchema } from '@/src/schemas';

import { LoginResponse } from '../auth/types';
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from '../lib/sendRequestServerVanilla';

export const registerForm = async (values: RegisterSchema) => {
  try {
    const { email, password, code } = values;

    // ✅ Usar API client configurado
    const response = await sendRequestServerVanilla.post(ROUTES.AUTH.REGISTER, {
      email,
      password,
      code,
    });

    // ✅ Lidar com resposta de forma consistente
    const result = await handleApiResponse<LoginResponse>(response);

    if (!result.success) {
      return { error: result.error };
    }

    // ✅ Redirecionar usando rotas centralizadas
    redirect(ROUTES.PROTECTED.DASHBOARD);
  } catch (error) {
    console.error('Registration error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Something went wrong during registration.',
    };
  }
};
