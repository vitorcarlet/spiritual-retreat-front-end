"use client";
import { useState, Fragment, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Alert,
  Chip,
  alpha,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useModal } from "@/src/hooks/useModal";
import { useUserContent } from "../context";
import NewLoginForm from "./newLoginForm";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../loading";
import { useSession } from "next-auth/react";
import getPermission from "@/src/utils/getPermission";

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
  return (
    <Box
      onClick={onClick}
      // focusRipple
      // TouchRippleProps={{ center: false }}
      sx={(theme) => ({
        // Layout
        width: "100%",
        textAlign: "left",
        borderRadius: 2,
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,

        // Border & bg
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",

        // Transitions
        transition: theme.transitions.create(
          ["border-color", "box-shadow", "background-color", "transform"],
          { duration: theme.transitions.duration.shorter }
        ),

        // Hover + Focus ring
        "&:hover": {
          borderColor: "primary.main",
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
        "&:focus-visible": {
          borderColor: "primary.main",
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
        },

        // Press feedback
        "&:active": {
          transform: "translateY(1px)",
          borderColor: "primary.main",
          boxShadow: `0 0 0 3px ${alpha(
            theme.palette.primary.main,
            0.18
          )} inset`,
        },

        // Ripple color tweak (subtle primary-tinted ripple)
        "& .MuiTouchRipple-child": {
          backgroundColor:
            theme.palette.mode === "dark"
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
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          {endAdornment}
        </Box>
      ) : null}
    </Box>
  );
}

const getUserCredentials = async (id: string) => {
  const response = await handleApiResponse<UserCredentialsInfo>(
    await sendRequestServerVanilla.get(`/user/${id}/credentials`)
  );
  if (!response || response.error) {
    throw new Error("Failed to fetch user credentials");
  }
  return response.data as UserCredentialsInfo;
};

const UserCredentialsPage = () => {
  const modal = useModal();
  const [userCredentials, setUserCredentials] =
    useState<UserCredentialsInfo | null>();

  //const { login, email, emailVerified } = userCredentials || {};
  const session = useSession();
  const canEditLogin = getPermission({
    permissions: session?.data?.user.permissions,
    permission: "users.edit",
    role: session?.data?.user.role,
  });
  const { user } = useUserContent();
  const id = user?.id as string;

  const { data: credentialsData, isLoading } = useQuery({
    queryKey: ["credentials"],
    queryFn: () => getUserCredentials(id),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });

  const [currentEmail, setCurrentEmail] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState<boolean | undefined>();

  useEffect(() => {
    if (credentialsData) {
      setUserCredentials(credentialsData);
      setCurrentEmail(credentialsData.email);
      setIsVerified(credentialsData.emailVerified);
    }
  }, [credentialsData]);

  const setUserForModal = (data: UserCredentialsInfo) => {
    setUserCredentials((prev) => ({
      ...prev!,
      ...data,
    }));
  };

  // Modals
  const handleEditLogin = () => {
    if (!canEditLogin) return;
    modal.open({
      key: "edit-login",
      title: "Alterar Login",
      customRender: () => (
        <NewLoginForm
          userLogin={userCredentials?.login ?? ""}
          setUserForModal={setUserForModal}
        />
      ),
    });
  };

  const handleEditEmail = () => {
    modal.open({
      key: "edit-email",
      title: "Alterar Email",
      customRender: () => (
        <Box p={2}>
          <Typography>Digite o novo e-mail:</Typography>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => {
              // TODO: chamada API para atualizar email
              setCurrentEmail("novo.email@exemplo.com");
              setIsVerified(false);
              modal.close();
            }}
          >
            Confirmar
          </Button>
        </Box>
      ),
    });
  };

  const handleRecoverPassword = () => {
    modal.open({
      key: "recover-password",
      title: "Recuperar Senha",
      customRender: () => (
        <Box p={2}>
          <Typography mb={2}>
            Escolha como deseja receber o processo de recuperação de senha:
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => modal.close()}>
              Via Email
            </Button>
            <Button variant="contained" onClick={() => modal.close()}>
              Via SMS
            </Button>
          </Stack>
        </Box>
      ),
    });
  };

  const handleEditPassword = () => {
    modal.open({
      key: "edit-password",
      title: "Alterar Senha",
      customRender: () => (
        <Box p={2}>
          <Typography>Digite a nova senha:</Typography>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => {
              // TODO: chamada API para atualizar senha
              modal.close();
            }}
          >
            Confirmar
          </Button>
        </Box>
      ),
    });
  };

  if (isLoading) {
    return <Loading text={"Carregando credenciais do usuário..."} />;
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
        Seção dedicada à redefinição de credenciais de usuários.
      </Alert>

      <Stack spacing={1.5}>
        <SettingRow
          icon={<PersonOutlineIcon fontSize="medium" />}
          title="Login"
          subtitle={userCredentials?.login || "—"}
          onClick={canEditLogin ? handleEditLogin : undefined}
          endAdornment={
            !canEditLogin ? <Chip size="small" label="Somente leitura" /> : null
          }
        />

        <SettingRow
          icon={<EmailOutlinedIcon fontSize="medium" />}
          title="Email"
          subtitle={
            <Fragment>
              {currentEmail || "—"}
              {isVerified === false && (
                <Typography component="span" color="warning.main" ml={1}>
                  • não verificado
                </Typography>
              )}
            </Fragment>
          }
          onClick={handleEditEmail}
          endAdornment={
            isVerified ? (
              <Chip size="small" color="success" label="Verificado" />
            ) : (
              <Chip size="small" color="warning" label="Pendente" />
            )
          }
        />

        <SettingRow
          icon={<LockOutlinedIcon fontSize="medium" />}
          title="Senha"
          subtitle="************"
          onClick={handleRecoverPassword}
          endAdornment={
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={handleRecoverPassword}>
                Recuperar
              </Button>
              <Button variant="contained" onClick={handleEditPassword}>
                Modificar senha
              </Button>
            </Box>
          }
        />
      </Stack>
    </Box>
  );
};

export default UserCredentialsPage;
