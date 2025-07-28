"use client";
import { useState, useEffect } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import { ParamValue } from "next/dist/server/request/params";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { useParams } from "next/navigation";
import { useModal } from "@/src/hooks/useModal";

interface UserCredentialsInfo {
  login: string;
  email: string;
  emailVerified: boolean;
  canEditLogin?: boolean;
}

// const userCredentialsRequest = async (id: ParamValue) => {
//   try {
//     const credentials = await handleApiResponse<UserCredentialsInfo>(
//       await sendRequestServerVanilla.get(`/api/user/${id}/credentials`)
//     );
//     return credentials.data;
//   } catch (error) {
//     console.error("Error fetching user credentials:", error);
//   }
// };

export const UserCredentialsPage = () => {
  const params = useParams();
  const id = params?.id;
  console.log("UserCredentialsPage params:", params);
  console.log("UserCredentialsPage id:", id);
  const modal = useModal();
  const [userCredentials, setUserCredentials] =
    useState<UserCredentialsInfo | null>(null);
  const {
    login,
    email,
    emailVerified,
    canEditLogin = false,
  } = userCredentials || {};
  const [currentEmail, setCurrentEmail] = useState(email);
  const [isVerified, setIsVerified] = useState(emailVerified);

  useEffect(() => {
    const userCredentialsRequest = async (id: ParamValue) => {
      try {
        const { data } = await handleApiResponse<UserCredentialsInfo>(
          await sendRequestServerVanilla.get(`/api/user/${id}/credentials`)
        );
        if (data) setUserCredentials(data);
      } catch (error) {
        console.error("Error fetching user credentials:", error);
      }
    };
    userCredentialsRequest(id);
  }, []);

  // Modal handlers
  const handleEditLogin = () => {
    modal.open({
      title: "Alterar Login",
      customRender: () => (
        <Box p={2}>
          <Typography>Digite o novo login:</Typography>
          {/* ...input e lógica de confirmação... */}
          <Button
            variant="contained"
            onClick={() => {
              // Simula atualização do login
              modal.close();
            }}
          >
            Confirmar
          </Button>
        </Box>
      ),
    });
  };

  const handleEditEmail = () => {
    modal.open({
      title: "Alterar Email",
      customRender: () => (
        <Box p={2}>
          <Typography>Digite o novo e-mail:</Typography>
          {/* ...input e lógica de confirmação... */}
          <Button
            variant="contained"
            onClick={() => {
              // Simula alteração de email e verificação
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
            <Button
              variant="contained"
              onClick={() => {
                // Simula envio por email
                modal.close();
              }}
            >
              Via Email
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // Simula envio por SMS
                modal.close();
              }}
            >
              Via SMS
            </Button>
          </Stack>
        </Box>
      ),
    });
  };

  return (
    <Box p={3} bgcolor="background.paper" borderRadius={4}>
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            {/* Ícone login */}
            <Typography fontWeight={600} fontSize={18}>
              Login
            </Typography>
            <Typography>{login}</Typography>
          </Box>
          {canEditLogin && (
            <Button variant="outlined" onClick={handleEditLogin}>
              Editar
            </Button>
          )}
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            {/* Ícone email */}
            <Typography fontWeight={600} fontSize={18}>
              Email
            </Typography>
            <Typography>{currentEmail}</Typography>
            {!isVerified && (
              <Typography color="warning.main" fontSize={14} ml={1}>
                não verificado
              </Typography>
            )}
          </Box>
          <Button variant="outlined" onClick={handleEditEmail}>
            Editar
          </Button>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            {/* Ícone senha */}
            <Typography fontWeight={600} fontSize={18}>
              Senha
            </Typography>
            <Typography>************</Typography>
          </Box>
          <Button variant="outlined" onClick={handleEditPassword}>
            Recuperar
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
