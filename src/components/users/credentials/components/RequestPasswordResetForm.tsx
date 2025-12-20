import { ChangeEvent, FormEvent, useState } from 'react';

import { useSnackbar } from 'notistack';

import { Box, Button, Stack, TextField, Typography } from '@mui/material';

import apiClient from '@/src/lib/axiosClientInstance';

interface RequestPasswordResetFormProps {
  defaultEmail?: string;
  onClose: () => void;
}

const RequestPasswordResetForm = ({
  defaultEmail,
  onClose,
}: RequestPasswordResetFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiClient.post('/auth/request-password-reset', {
        email: trimmedEmail,
      });

      enqueueSnackbar('Solicitação enviada. Verifique o e-mail informado.', {
        variant: 'success',
      });
      onClose();
    } catch (error) {
      console.error('Failed to request password reset', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a solicitação.';
      enqueueSnackbar(message, {
        variant: 'error',
      });
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={2} minWidth={320}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Informe o e-mail do usuário para enviar a solicitação de redefinição
          de senha.
        </Typography>
        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={handleEmailChange}
          required
          autoFocus
          fullWidth
          autoComplete="email"
          disabled={isSubmitting}
          error={Boolean(errorMessage)}
          helperText={
            errorMessage ?? 'O usuário receberá instruções no e-mail informado.'
          }
        />
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          alignItems="center"
        >
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default RequestPasswordResetForm;
