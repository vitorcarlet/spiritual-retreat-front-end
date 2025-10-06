"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type MouseEvent,
} from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/src/theme/DarkModeContext";

type ThemeOption = "light" | "dark";

const LANGUAGE_OPTIONS = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const Settings = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const locale = useLocale();
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  const handleModeChange = (
    _event: MouseEvent<HTMLElement>,
    nextMode: ThemeOption | null
  ) => {
    if (!nextMode) return;
    const willEnableDarkMode = nextMode === "dark";
    if (willEnableDarkMode !== darkMode) {
      toggleDarkMode();
    }
  };

  const handleLocaleChange = (event: SelectChangeEvent<string>) => {
    const nextLocale = event.target.value;
    if (!nextLocale || nextLocale === selectedLocale) return;

    setSelectedLocale(nextLocale);

    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${COOKIE_MAX_AGE}`;
      router.refresh();
    });

    try {
      localStorage.setItem("app-locale", nextLocale);
    } catch (error) {
      console.warn("Unable to persist locale preference", error);
    }
  };

  const selectedLanguageLabel = useMemo(() => {
    const option = LANGUAGE_OPTIONS.find(
      (item) => item.value === selectedLocale
    );
    return option?.label ?? selectedLocale;
  }, [selectedLocale]);

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 720, mx: "auto" }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Configurações
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Personalize sua experiência ajustando o tema e o idioma de exibição.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" component="h2">
                  Tema
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Escolha entre modo claro ou escuro para a interface.
                </Typography>
              </Box>

              <ToggleButtonGroup
                color="primary"
                exclusive
                value={darkMode ? "dark" : "light"}
                onChange={handleModeChange}
                size="large"
              >
                <ToggleButton value="light">Claro</ToggleButton>
                <ToggleButton value="dark">Escuro</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" component="h2">
                  Idioma
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Selecione o idioma preferido para a interface do sistema.
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel id="language-select-label">Idioma</InputLabel>
                <Select
                  labelId="language-select-label"
                  label="Idioma"
                  value={selectedLocale}
                  onChange={handleLocaleChange}
                  disabled={isPending}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider flexItem />

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Idioma atual:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedLanguageLabel}
                </Typography>
                {isPending && <CircularProgress size={18} />}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Settings;
