'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { UserObject, UserRoles } from 'next-auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useSnackbar } from 'notistack';

import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Box,
  Button,
  ButtonBase,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import { useMenuMode } from '@/src/contexts/users-context/MenuModeContext';
import { useModal } from '@/src/hooks/useModal';
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from '@/src/lib/sendRequestServerVanilla';

import TextFieldMasked from '../../fields/maskedTextFields/TextFieldMasked';
import ProfilePictureModal from '../../profile/ProfilePictureModal';
import { useUserContent } from '../context';
import { UserObjectWithId } from './types';

const FALLBACK_PROFILE_IMAGE =
  'https://fastly.picsum.photos/id/503/200/200.jpg?hmac=genECHjox9165KfYsOiMMCmN-zGqh9u-lnhqcFinsrU';

const UserEditPage = () => {
  const { user, setUser } = useUserContent();
  const { menuMode } = useMenuMode();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const isReadOnly = menuMode === 'view';
  const canEditProfilePicture = !isReadOnly && !!user?.id;
  const isLoading = false;
  // Modo de criação quando não há usuário carregado
  const isCreating = !user;
  // Estado do formulário
  const [formData, setFormData] = useState<
    Omit<
      UserObject,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'state'
      | 'email'
      | 'permissions'
      | 'first_name'
      | 'last_name'
      | 'profile_picture'
      | 'birth'
      | 'city'
      | 'stateShort'
      | 'cpf'
    >
  >({
    name: '',
    phone: '',
    role: 'participant',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    user?.profile_picture ?? null
  );
  const modal = useModal();

  useEffect(() => {
    setProfileImageUrl(user?.profile_picture ?? null);
  }, [user?.profile_picture]);

  const displayedProfileImage = useMemo(
    () => profileImageUrl ?? FALLBACK_PROFILE_IMAGE,
    [profileImageUrl]
  );

  const handleProfilePictureUpdated = useCallback(
    async (nextUrl: string | null) => {
      setProfileImageUrl(nextUrl);
      if (user) {
        setUser({
          ...user,
          profile_picture: nextUrl ?? null,
        } as UserObject);
      }
    },
    [setUser, user]
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange =
    (field: keyof UserObject) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      role: event.target.value as UserRoles,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isCreating) {
        // CREATE
        const res = await handleApiResponse<UserObjectWithId>(
          await sendRequestServerVanilla.post('/users/create', formData)
        );

        if (res.error || !res.data)
          throw new Error(res.error || 'Falha ao criar usuário');
        const data = res.data as unknown as UserObject;
        router.push(`/users/${data.id}`);
      } else {
        // UPDATE
        if (!user?.id) throw new Error('ID do usuário não encontrado');
        const res = await handleApiResponse<UserObjectWithId>(
          await sendRequestServerVanilla.put(`/api/user/${user.id}`, formData)
        );

        if (res.error)
          throw new Error(res.error || 'Falha ao atualizar usuário');

        const updatedUser = (res.data as unknown as UserObject) ?? null;
        if (updatedUser) {
          setUser(updatedUser);
        }

        enqueueSnackbar('Usuário atualizado com sucesso!', {
          variant: 'success',
        });

        // Replace para manter rota atual e garantir sincronização
        //router.replace(`/users/${updatedUser?.id ?? user.id}`);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro. Tente novamente.';

      enqueueSnackbar(message, {
        variant: 'errorMUI',
      });
      console.error('User submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenProfilePictureModal = useCallback(() => {
    if (!user?.id) return;

    modal.open({
      key: 'profile-picture',
      title: 'Atualizar foto de perfil',
      size: 'sm',
      customRender: () => (
        <ProfilePictureModal
          userId={user.id}
          userName={user.name}
          currentImage={profileImageUrl}
          onClose={modal.close}
          onUploadSuccess={handleProfilePictureUpdated}
        />
      ),
    });
  }, [modal, profileImageUrl, handleProfilePictureUpdated, user]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: '100%', p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="circular" width={200} height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(5)].map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        pt: 0,
      }}
    >
      {/* Header com imagem de fundo */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '200px',
          }}
        >
          <Image
            src="/images/background16-9.png"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </Box>

        <ButtonBase
          onClick={handleOpenProfilePictureModal}
          disabled={!canEditProfilePicture || isSubmitting}
          sx={{
            position: 'relative',
            transform: 'translate(25%, -50%)',
            width: 200,
            height: 200,
            borderRadius: '50%',
            border: '4px solid white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            marginBottom: '-100px',
            overflow: 'hidden',
            p: 0,
            backgroundColor: 'transparent',
            cursor: canEditProfilePicture ? 'pointer' : 'default',
            '&:disabled': {
              cursor: 'default',
              opacity: 1,
            },
            ...(canEditProfilePicture
              ? {
                  '&:hover .profile-picture-overlay': {
                    opacity: 1,
                  },
                }
              : {}),
          }}
          aria-label={
            canEditProfilePicture
              ? 'Atualizar foto de perfil'
              : 'Foto de perfil'
          }
        >
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <Image
              src={displayedProfileImage}
              alt={
                user?.name
                  ? `Foto de ${user.name}`
                  : 'Foto de perfil do usuário'
              }
              fill
              style={{ objectFit: 'cover' }}
            />
          </Box>
          {canEditProfilePicture && (
            <Box
              className="profile-picture-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)',
                color: 'common.white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                opacity: 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none',
              }}
            >
              <EditRoundedIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                Alterar foto
              </Typography>
            </Box>
          )}
        </ButtonBase>
        {canEditProfilePicture && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              width: 200,
              textAlign: 'center',
              transform: 'translate(25%, 25%)',
            }}
          >
            Clique para atualizar sua foto
          </Typography>
        )}
      </Box>

      {/* Formulário */}
      <Box sx={{ padding: 3, paddingTop: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          {isCreating ? 'Criar Usuário' : `Editar Usuário: ${user?.name ?? ''}`}
        </Typography>

        <Grid container spacing={3}>
          {/* Nome */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nome"
              variant="outlined"
              placeholder="Digite o nome"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              disabled={isReadOnly && !isCreating}
            />
          </Grid>

          {/* PHONE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextFieldMasked
              fullWidth
              label="Telefone"
              variant="outlined"
              placeholder="(49 999112345)"
              maskType="phone"
              value={formData.phone}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  phone: event.target.value,
                }));
              }}
              disabled={isReadOnly && !isCreating}
            />
          </Grid>

          {/* Role/Função */}
          <Grid size={12} sx={{ mb: 5 }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="select-role-label">Função</InputLabel>
              <Select
                labelId="select-role-label"
                value={formData.role}
                onChange={handleRoleChange}
                label="Função"
                required
                disabled={isReadOnly && !isCreating}
              >
                <MenuItem value="">
                  <em>Selecione uma função</em>
                </MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="manager">Gestor</MenuItem>
                <MenuItem value="consultant">Consultor</MenuItem>
                <MenuItem value="participant">Participante</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Botões de ação */}
          {(isCreating || !isReadOnly) && (
            <Grid size={12}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  mt: 2,
                }}
              >
                {!isCreating && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() => {
                      // Reset para dados originais do usuário
                      if (user) {
                        setFormData({
                          name: user.name || '',
                          phone: user.phone || '',
                          role: user.role || '',
                        });
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : isCreating
                      ? 'Salvar Usuário'
                      : 'Salvar Alterações'}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default UserEditPage;
