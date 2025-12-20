'use client';
import {
  ChangeEvent,
  FormEvent,
  Fragment,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSession } from 'next-auth/react';

import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
  useColorScheme,
} from '@mui/material';

import { useModal } from '@/src/hooks/useModal';
// import NewLoginForm from "./newLoginForm";
import apiClient from '@/src/lib/axiosClientInstance';
import getPermission from '@/src/utils/getPermission';

import Loading from '../../loading';
import { useUserContent } from '../context';
import RequestPasswordResetForm from './components/RequestPasswordResetForm';

function SettingRow({
  icon,
  title,
  subtitle,
  onClick,
  endAdornment,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  onClick?: () => void;
  endAdornment?: React.ReactNode;
}) {
  const { mode } = useColorScheme();
  return (
    <Box
      onClick={onClick}
      // focusRipple
      // TouchRippleProps={{ center: false }}
      sx={(theme) => ({
        // Layout
        width: '100%',
        textAlign: 'left',
        borderRadius: 2,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,

        // Border & bg
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',

        // Transitions
        transition: theme.transitions.create(
          ['border-color', 'box-shadow', 'background-color', 'transform'],
          { duration: theme.transitions.duration.shorter }
        ),

        // Hover + Focus ring
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
        '&:focus-visible': {
          borderColor: 'primary.main',
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
        },

        // Press feedback
        '&:active': {
          transform: 'translateY(1px)',
          borderColor: 'primary.main',
          boxShadow: `0 0 0 3px ${alpha(
            theme.palette.primary.main,
            0.18
          )} inset`,
        },

        // Ripple color tweak (subtle primary-tinted ripple)
        '& .MuiTouchRipple-child': {
          backgroundColor:
            mode === 'dark'
              ? alpha(theme.palette.primary.light, 0.35)
              : alpha(theme.palette.primary.main, 0.25),
        },
      })}
    >
      <Box display="flex" alignItems="center" gap={2} minWidth={0}>
        {icon}
        <Box minWidth={0}>
          <Typography fontWeight={600} fontSize={18} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {endAdornment ? (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          {endAdornment}
        </Box>
      ) : null}
    </Box>
  );
}

interface ForceEmailChangeFormProps {
  defaultEmail?: string;
  onSubmit: (email: string) => Promise<void>;
  onCancel: () => void;
}

const ForceEmailChangeForm = ({
  defaultEmail,
  onSubmit,
  onCancel,
}: ForceEmailChangeFormProps) => {
  const [value, setValue] = useState(defaultEmail ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = value.trim();

    if (!trimmedEmail) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit(trimmedEmail);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar o e-mail.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={2} minWidth={320}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Digite o novo e-mail do usuário. Essa ação força a alteração e
          reenviará o processo de verificação.
        </Typography>
        <TextField
          label="Novo e-mail"
          type="email"
          value={value}
          onChange={handleChange}
          required
          autoFocus
          autoComplete="email"
          fullWidth
          disabled={isSubmitting}
          error={Boolean(errorMessage)}
          helperText={errorMessage ?? 'Informe um endereço de e-mail válido.'}
        />
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          alignItems="center"
        >
          <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Confirmar'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

interface ForcePasswordChangeFormProps {
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
}

const ForcePasswordChangeForm = ({
  onSubmit,
  onCancel,
}: ForcePasswordChangeFormProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Informe uma senha válida.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit(password);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar a senha.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={2} minWidth={320}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Defina uma nova senha para o usuário. Ele será obrigado a utilizá-la
          no próximo acesso.
        </Typography>
        <TextField
          label="Nova senha"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          required
          autoFocus
          fullWidth
          autoComplete="new-password"
          disabled={isSubmitting}
        />
        <TextField
          label="Confirmar senha"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmChange}
          required
          fullWidth
          autoComplete="new-password"
          disabled={isSubmitting}
          error={Boolean(errorMessage)}
          helperText={errorMessage ?? 'Ambos os campos devem ser iguais.'}
        />
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          alignItems="center"
        >
          <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Confirmar'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

const getUserCredentials = async (id: string) => {
  try {
    const { data } = await apiClient.get<UserCredentialsInfo>(
      `/users/${id}/credentials`
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch user credentials', error);
    throw new Error('Failed to fetch user credentials');
  }
};

const UserCredentialsPage = () => {
  const modal = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const { user, setUser } = useUserContent();
  const [userCredentials, setUserCredentials] =
    useState<UserCredentialsInfo | null>(null);
  const [isUserBlocked, setIsUserBlocked] = useState<boolean>(false);
  const [isUpdatingBlockStatus, setIsUpdatingBlockStatus] = useState(false);

  //const { login, email, emailVerified } = userCredentials || {};
  const session = useSession();
  const canEditLogin = getPermission({
    permissions: session?.data?.user.permissions,
    permission: 'users.edit',
    role: session?.data?.user.role,
  });
  const canBlockUser = getPermission({
    permissions: session?.data?.user.permissions,
    permission: 'users.update',
    role: session?.data?.user.role,
  });
  const canForceEmailChange = useMemo(
    () =>
      getPermission({
        permissions: session?.data?.user.permissions,
        permission: 'users.update',
        role: session?.data?.user.role,
      }),
    [session?.data?.user.permissions, session?.data?.user.role]
  );
  const canForcePasswordChange = canForceEmailChange;
  const id = user?.id as string;

  const { data: credentialsData, isLoading } = useQuery({
    queryKey: ['credentials', id],
    queryFn: () => getUserCredentials(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });

  const [currentEmail, setCurrentEmail] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState<boolean | undefined>();

  useEffect(() => {
    if (credentialsData) {
      setUserCredentials(credentialsData);
      setCurrentEmail(credentialsData.email);
      setIsVerified(credentialsData.emailVerified);
      setIsUserBlocked(credentialsData.enabled === false);
    }
  }, [credentialsData]);

  // const setUserForModal = (data: UserCredentialsInfo) => {
  //   setUserCredentials((prev) => ({
  //     ...prev!,
  //     ...data,
  //   }));
  // };

  // Modals
  const handleEditLogin = () => {
    if (!canEditLogin) return;
    modal.open({
      key: 'edit-login',
      title: 'Alterar Login',
      customRender: () => <div>AAA</div>,
    });
  };

  const handleToggleBlock = async (
    _event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (!id) return;
    const shouldBlock = checked;
    const previousState = isUserBlocked;

    setIsUpdatingBlockStatus(true);
    setIsUserBlocked(shouldBlock);

    try {
      const actionEndpoint = shouldBlock ? 'block' : 'unblock';
      await apiClient.post(`/users/${id}/${actionEndpoint}`);

      setUserCredentials((prev) =>
        prev ? { ...prev, enabled: !shouldBlock } : prev
      );

      setUser(user ? { ...user, enabled: !shouldBlock } : null);

      enqueueSnackbar(
        shouldBlock
          ? 'Usuário bloqueado com sucesso.'
          : 'Usuário desbloqueado com sucesso.',
        {
          variant: 'success',
        }
      );
    } catch (error) {
      console.error('Failed to toggle user block status', error);
      setIsUserBlocked(previousState);
      setUserCredentials((prev) =>
        prev ? { ...prev, enabled: !previousState } : prev
      );
      setUser(user ? { ...user, enabled: !previousState } : null);
      enqueueSnackbar(
        shouldBlock
          ? 'Não foi possível bloquear o usuário.'
          : 'Não foi possível desbloquear o usuário.',
        {
          variant: 'error',
        }
      );
    } finally {
      setIsUpdatingBlockStatus(false);
    }
  };

  const handleForceEmailChange = async (newEmail: string) => {
    const trimmedEmail = newEmail.trim();
    if (!id) {
      const message = 'Usuário não encontrado.';
      enqueueSnackbar(message, { variant: 'error' });
      throw new Error(message);
    }

    try {
      await apiClient.post(`/users/${id}/force-change-email`, {
        newEmail: trimmedEmail,
      });

      setUserCredentials((prev) =>
        prev
          ? {
              ...prev,
              email: trimmedEmail,
              emailVerified: false,
            }
          : prev
      );
      setCurrentEmail(trimmedEmail);
      setIsVerified(false);
      setUser(user ? { ...user, email: trimmedEmail } : null);

      enqueueSnackbar('E-mail atualizado com sucesso.', {
        variant: 'success',
      });
      modal.close();
    } catch (error) {
      console.error('Failed to force email change', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar o e-mail.';
      enqueueSnackbar(message, {
        variant: 'error',
      });
      throw new Error(message);
    }
  };

  const handleEditEmail = () => {
    if (!canForceEmailChange) return;
    modal.open({
      key: 'force-email-change',
      title: 'Forçar alteração de e-mail',
      customRender: () => (
        <ForceEmailChangeForm
          defaultEmail={currentEmail}
          onSubmit={handleForceEmailChange}
          onCancel={modal.close}
        />
      ),
    });
  };

  const handleForcePasswordChange = async (newPassword: string) => {
    if (!id) {
      const message = 'Usuário não encontrado.';
      enqueueSnackbar(message, { variant: 'error' });
      throw new Error(message);
    }

    try {
      await apiClient.post(`/users/${id}/force-change-password`, {
        newPassword,
      });

      enqueueSnackbar('Senha atualizada com sucesso.', {
        variant: 'success',
      });
      modal.close();
    } catch (error) {
      console.error('Failed to force password change', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar a senha.';
      enqueueSnackbar(message, {
        variant: 'error',
      });
      throw new Error(message);
    }
  };

  const handleRecoverPassword = () => {
    modal.open({
      key: 'recover-password',
      title: 'Recuperar Senha',
      customRender: () => (
        <RequestPasswordResetForm
          defaultEmail={currentEmail}
          onClose={modal.close}
        />
      ),
    });
  };

  const handleEditPassword = () => {
    if (!canForcePasswordChange) return;
    modal.open({
      key: 'force-password-change',
      title: 'Forçar alteração de senha',
      customRender: () => (
        <ForcePasswordChangeForm
          onSubmit={handleForcePasswordChange}
          onCancel={modal.close}
        />
      ),
    });
  };

  if (isLoading) {
    return <Loading text={'Carregando credenciais do usuário...'} />;
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
        Seção dedicada à redefinição de credenciais de usuários.
      </Alert>

      <Stack spacing={1.5}>
        <SettingRow
          icon={<BlockOutlinedIcon fontSize="medium" />}
          title="Status do usuário"
          subtitle={
            isUserBlocked ? 'Usuário bloqueado' : 'Usuário ativo e habilitado'
          }
          endAdornment={
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={isUserBlocked ? 'Bloqueado' : 'Ativo'}
                color={isUserBlocked ? 'error' : 'success'}
              />
              {!canBlockUser && (
                <Chip size="small" color="default" label="Somente leitura" />
              )}
              <Switch
                checked={isUserBlocked}
                onChange={handleToggleBlock}
                disabled={
                  !canBlockUser || isUpdatingBlockStatus || !userCredentials
                }
                inputProps={{ 'aria-label': 'Alternar bloqueio do usuário' }}
              />
            </Stack>
          }
        />

        <SettingRow
          icon={<PersonOutlineIcon fontSize="medium" />}
          title="Login"
          subtitle={userCredentials?.login || '—'}
          onClick={canEditLogin ? handleEditLogin : undefined}
          endAdornment={
            !canEditLogin ? (
              <Chip color="default" size="small" label="Somente leitura" />
            ) : null
          }
        />

        <SettingRow
          icon={<EmailOutlinedIcon fontSize="medium" />}
          title="Email"
          subtitle={
            <Fragment>
              {currentEmail || '—'}
              {isVerified === false && (
                <Typography component="span" color="warning.main" ml={1}>
                  • não verificado
                </Typography>
              )}
            </Fragment>
          }
          onClick={canForceEmailChange ? handleEditEmail : undefined}
          endAdornment={
            <Stack direction="row" spacing={1} alignItems="center">
              {isVerified ? (
                <Chip size="small" color="success" label="Verificado" />
              ) : (
                <Chip size="small" color="warning" label="Pendente" />
              )}
              {!canForceEmailChange && (
                <Chip size="small" color="default" label="Somente leitura" />
              )}
            </Stack>
          }
        />

        <SettingRow
          icon={<LockOutlinedIcon fontSize="medium" />}
          title="Senha"
          subtitle="************"
          onClick={handleRecoverPassword}
          endAdornment={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={handleRecoverPassword}>
                Recuperar
              </Button>
              <Button
                variant="contained"
                onClick={handleEditPassword}
                disabled={!canForcePasswordChange}
              >
                Modificar senha
              </Button>
              {!canForcePasswordChange && (
                <Chip size="small" color="default" label="Somente leitura" />
              )}
            </Box>
          }
        />
      </Stack>
    </Box>
  );
};

export default UserCredentialsPage;
