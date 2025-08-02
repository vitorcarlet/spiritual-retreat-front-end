import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import Iconify from "@/src/components/Iconify";
import SettingsIcon from "@mui/icons-material/Settings";
import { useModal } from "@/src/hooks/useModal";
import { useTranslations } from "next-intl";

const notifications = [
  {
    id: 1,
    title: "família_preenchida",
    description: "família_souza_preenchida",
    date: "4_dias_atras",
  },
  {
    id: 2,
    title: "Participante aceitou!",
    description: "Participante Souza aceitou o contemplamento com sucesso!",
    date: "2 dias atrás",
  },
  // ...adicione mais notificações conforme necessário
];

const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const modal = useModal();
  const t = useTranslations("notifications");

  const handleConfigClick = () => {
    modal.open({
      title: t("configuration"),
      size: "lg",
      customRender() {
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">{t("configuration")}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Aqui você pode configurar suas notificações.
            </Typography>
            {/* Adicione mais opções de configuração conforme necessário */}
          </Box>
        );
      },
    });
  };

  return (
    <>
      {/* Botão para abrir o drawer */}
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Iconify icon="solar:bell-bing-bold-duotone" />
      </IconButton>

      {/* Drawer de notificações */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              zIndex: (theme) => theme.zIndex.drawer + 900,
              width: 380,
              maxWidth: "100vw",
              height: "100vh",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", p: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("notifications")}
          </Typography>
          <IconButton onClick={handleConfigClick}>
            <SettingsIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {notifications.map((n) => (
            <ListItem key={n.id} alignItems="flex-start">
              <ListItemText
                primary={<Typography fontWeight={600}>{n.title}</Typography>}
                secondary={
                  <>
                    <Typography variant="body2">{n.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.date}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationsMenu;
