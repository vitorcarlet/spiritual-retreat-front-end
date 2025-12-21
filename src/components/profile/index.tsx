'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UserObject } from 'next-auth';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useSnackbar } from 'notistack';

import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Box,
  Button,
  ButtonBase,
  Grid,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import TextFieldMasked from '@/src/components/fields/maskedTextFields/TextFieldMasked';
import { useModal } from '@/src/hooks/useModal';
import apiClient from '@/src/lib/axiosClientInstance';

import ProfilePictureModal from './ProfilePictureModal';

type FormDataShape = Pick<UserObject, 'name'> & { phone: string };

const FALLBACK_PROFILE_IMAGE =
  'https://fastly.picsum.photos/id/503/200/200.jpg?hmac=genECHjox9165KfYsOiMMCmN-zGqh9u-lnhqcFinsrU';

const mapUserToFormData = (
  user: UserObject | null | undefined
): FormDataShape => {
  const candidate = user as unknown as
    | { phone?: string; number?: string }
    | undefined;
  return {
    name: user?.name ?? '',
    phone: candidate?.phone ?? candidate?.number ?? '',
  };
};

const ProfilePage = () => {
  const router = useRouter();
  const modal = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const { data: session, status, update } = useSession();
  const user = session?.user ?? null;

  const initialFormValues = useMemo(() => mapUserToFormData(user), [user]);
  const [formData, setFormData] = useState<FormDataShape>(initialFormValues);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    user?.profile_picture ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    setFormData(initialFormValues);
  }, [initialFormValues]);

  useEffect(() => {
    setProfileImageUrl(user?.profile_picture ?? null);
  }, [user?.profile_picture]);

  const handleInputChange =
    (field: keyof FormDataShape) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleProfilePictureUpdated = useCallback(
    async (nextUrl: string | null) => {
      setProfileImageUrl(nextUrl);
      try {
        await update?.();
      } catch (error) {
        console.error('Erro ao atualizar a sessão após trocar a foto:', error);
      }
    },
    [update]
  );

  const handleOpenProfilePictureModal = useCallback(() => {
    if (!user) return;

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.put<UserObject>(
        `/api/user/${user.id}`,
        formData
      );

      const updatedUser = response.data ?? null;
      if (updatedUser) {
        setFormData(mapUserToFormData(updatedUser));
        await update?.();
      }

      enqueueSnackbar('Dados atualizados com sucesso!', { variant: 'success' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar seus dados.';
      enqueueSnackbar(message, { variant: 'error' });
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormValues);
  };

  if (status === 'loading') {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Skeleton variant="rounded" width={160} height={160} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="text" height={56} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="text" height={56} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Não foi possível carregar os dados do usuário.
        </Typography>
      </Box>
    );
  }

  const displayedProfileImage = profileImageUrl || FALLBACK_PROFILE_IMAGE;

  return (
    <Box component="section" sx={{ px: 3, py: 4 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 4 }}>
        Informações pessoais
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
        <ButtonBase
          onClick={handleOpenProfilePictureModal}
          sx={{
            borderRadius: '50%',
            overflow: 'hidden',
            width: 160,
            height: 160,
            position: 'relative',
            '&:hover .profile-edit-overlay': { opacity: 1 },
          }}
        >
          <Image
            src={displayedProfileImage}
            alt={user.name ?? 'Foto de perfil'}
            width={160}
            height={160}
            style={{ objectFit: 'cover' }}
          />
          <Box
            className="profile-edit-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
              color: 'common.white',
              pointerEvents: 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditRoundedIcon fontSize="small" />
              <Typography variant="body2">Alterar foto</Typography>
            </Box>
          </Box>
        </ButtonBase>
        <Typography variant="caption" color="text.secondary">
          Clique na foto para atualizar.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={isSubmitting}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextFieldMasked
              fullWidth
              label="Telefone"
              placeholder="(11) 99999-9999"
              maskType="phone"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfilePage;
