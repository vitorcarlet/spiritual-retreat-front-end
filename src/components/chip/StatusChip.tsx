"use client";
import { Chip, SxProps } from "@mui/material";

export type Status =
  | "active"
  | "inactive"
  | "open"
  | "closed"
  | "running"
  | "ended"
  | "upcoming";

export const StatusChip = ({
  status,
  sx,
}: {
  status: Status;
  sx?: SxProps;
}) => {
  switch (status) {
    case "active":
      return <Chip color="success" label="Ativo" />;
    case "inactive":
      return (
        <Chip
          sx={{
            ...sx,
            color: "text.primary",
          }}
          label="Inativo"
        />
      );
    case "open":
      return (
        <Chip
          size="medium"
          sx={{
            ...sx,
            backgroundColor: "success.light",
            color: "success.main",
            fontWeight: "bold",
          }}
          label="Aberto"
        />
      );
    case "closed":
      return <Chip color="secondary" label="Fechado" />;
    case "running":
      return <Chip color="warning" label="Em Andamento" />;
    case "ended":
      return <Chip color="error" label="Encerrado" />;
    case "upcoming":
      return <Chip color="info" label="Próximo" />;
    default:
      return <Chip label="Desconhecido" />;
  }
};
