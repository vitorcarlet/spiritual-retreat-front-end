"use client";
import { useState, Fragment } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Alert,
  Chip,
  alpha,
} from "@mui/material";

import ButtonBase from "@mui/material/ButtonBase";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useModal } from "@/src/hooks/useModal";
import { useUserContent } from "../context";
import NewLoginForm from "./newLoginForm";
import { User } from "next-auth";

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
    <ButtonBase
      onClick={onClick}
      focusRipple
      TouchRippleProps={{ center: false }}
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
    </ButtonBase>
  );
}

export const UserCredentialsPage = () => {
  const { user, setUser } = useUserContent();
  const modal = useModal();
  const [userCredentials, setUserCredentials] =
    useState<UserCredentialsInfo | null>(user);

  const {
    login,
    email,
    emailVerified,
    canEditLogin = true,
  } = userCredentials || {};

  const [currentEmail, setCurrentEmail] = useState<string | undefined>(email);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(
    emailVerified
  );

  // useEffect(() => {
  //   if (!id) return;
  //   const userCredentialsRequest = async (idParam: ParamValue) => {
  //     try {
  //       const { data } = await handleApiResponse<UserCredentialsInfo>(
  //         await sendRequestServerVanilla.get(`/api/user/${idParam}/credentials`)
  //       );
  //       if (data) {
  //         setUserCredentials(data);
  //         setCurrentEmail(data.email);
  //         setIsVerified(data.emailVerified);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user credentials:", error);
  //     }
  //   };
  //   userCredentialsRequest(id);
  // }, [id]);

  const setUserForModal = (data: UserCredentialsInfo) => {
    setUserCredentials((prev) => ({
      ...prev!,
      ...data,
    }));
    setUser((prev: User) => ({
      ...prev!,
      ...data,
    }));
  };

  // Modals
  const handleEditLogin = () => {
    if (!canEditLogin) return;
    modal.open({
      title: "Alterar Login",
      customRender: () => (
        <NewLoginForm
          userLogin={login ?? ""}
          setUserForModal={setUserForModal}
        />
      ),
    });
  };

  const handleEditEmail = () => {
    modal.open({
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

  const handleEditPassword = () => {
    modal.open({
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

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
        Seção dedicada à redefinição de credenciais de usuários.
      </Alert>

      <Stack spacing={1.5}>
        <SettingRow
          icon={<PersonOutlineIcon fontSize="medium" />}
          title="Login"
          subtitle={login || "—"}
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
          onClick={handleEditPassword}
          endAdornment={
            <Button variant="outlined" onClick={handleEditPassword}>
              Recuperar
            </Button>
          }
        />
      </Stack>
    </Box>
  );
};
