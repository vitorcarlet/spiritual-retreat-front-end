"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Divider,
  Switch,
  Button,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";

export type NotificationSettings = {
  sound: string; // id do som escolhido
  floating: boolean; // se quer notificações flutuantes
};

export const NOTIFICATION_SOUNDS = [
  { id: "none", name: "Sem som", src: "" },
  { id: "ding-1", name: "Ding dong", src: "/sounds/ding-1.mp3" },
  { id: "ding-2", name: "Ding dong", src: "/sounds/ding-2.mp3" },
  { id: "ding-3", name: "Ding dong", src: "/sounds/ding-3.mp3" },
] as const;

const STORAGE_KEY = "notifications:settings";

export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined")
    return { sound: NOTIFICATION_SOUNDS[0].id, floating: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sound: NOTIFICATION_SOUNDS[0].id, floating: true };
    const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
    return {
      sound: parsed.sound || NOTIFICATION_SOUNDS[0].id,
      floating: typeof parsed.floating === "boolean" ? parsed.floating : true,
    };
  } catch {
    return { sound: NOTIFICATION_SOUNDS[0].id, floating: true };
  }
}

export function saveNotificationSettings(s: NotificationSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

type Props = {
  initial?: NotificationSettings;
  onSave?: (settings: NotificationSettings) => void;
};

export default function NotificationsConfig({ initial, onSave }: Props) {
  const [settings, setSettings] = useState<NotificationSettings>(
    initial || loadNotificationSettings()
  );
  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initial) setSettings(initial);
  }, [initial]);

  const play = (id: string) => {
    const sound =
      NOTIFICATION_SOUNDS.find((s) => s.id === id) || NOTIFICATION_SOUNDS[0];

    // Don't play anything if "no sound" is selected
    if (sound.id === "none" || !sound.src) return;

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = sound.src;
    audioRef.current.play().catch(() => {});
    setPreviewId(id);
    audioRef.current.onended = () => setPreviewId(null);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPreviewId(null);
  };

  const handleSave = () => {
    saveNotificationSettings(settings);
    onSave?.(settings);
  };

  return (
    <Box sx={{ p: 2, width: "100%" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Som da notificação
      </Typography>

      <Stack
        spacing={1}
        sx={{ bgcolor: "action.hover", borderRadius: 2, p: 1.5 }}
      >
        <RadioGroup
          value={settings.sound}
          onChange={(_, v) => setSettings((prev) => ({ ...prev, sound: v }))}
        >
          {NOTIFICATION_SOUNDS.map((s) => (
            <Stack
              key={s.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ p: 0.5 }}
            >
              <FormControlLabel
                value={s.id}
                control={<Radio size="small" />}
                label={s.name}
              />
              {s.id !== "none" && (
                <IconButton
                  size="small"
                  onClick={() => (previewId === s.id ? stop() : play(s.id))}
                >
                  {previewId === s.id ? (
                    <StopRoundedIcon />
                  ) : (
                    <PlayArrowRoundedIcon />
                  )}
                </IconButton>
              )}
            </Stack>
          ))}
        </RadioGroup>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Notificações flutuantes
        </Typography>
        <Switch
          checked={settings.floating}
          onChange={(_, c) => setSettings((prev) => ({ ...prev, floating: c }))}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Button onClick={handleSave} variant="contained" fullWidth>
        Salvar
      </Button>
    </Box>
  );
}
