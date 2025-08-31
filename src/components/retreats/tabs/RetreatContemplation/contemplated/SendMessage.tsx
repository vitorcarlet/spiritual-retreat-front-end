"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Stack,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  Paper,
  Collapse,
  Fade,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";

// TipTap / mui-tiptap
// yarn add mui-tiptap @tiptap/react @tiptap/starter-kit @tiptap/extension-mention
import {
  RichTextField,
  RichTextEditorProvider,
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
} from "mui-tiptap";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import { Editor, useEditor } from "@tiptap/react";

export interface MessageParticipant {
  id: number;
  name: string;
  //avatarUrl?: string;
}

export interface MessageVariable {
  key: string; // token sem @ (ex: nome, dataInicio)
  label: string; // ex: Nome do participante
  description?: string; // tooltip opcional
  sampleValue?: string;
}

interface SendMessageProps {
  participants: MessageParticipant[];
  preselectedIds?: string[];
  loadingParticipants?: boolean;
  variables?: MessageVariable[];
  defaultMessageTemplate?: string;
  maxVisibleChips?: number;
  onSubmit?: (payload: {
    participantIds: string[];
    messageHtml: string;
    messageText: string;
    channels: { whatsapp: boolean; email: boolean; sms: boolean };
  }) => Promise<void> | void;
  onCancel?: () => void;
  disabled?: boolean;
}

const DEFAULT_TEMPLATE = `Olá @nome, que alegria! 🎉
Você foi contemplado(a) para participar do retiro "@nomeRetiro" que acontecerá entre os dias @dataInicio e @dataFim.

Por favor, confirme sua participação até o dia @dataLimiteConfirmacao através do link abaixo:
@linkConfirmacao
`;

function buildMentionExtension(vars: MessageVariable[] | undefined) {
  return Mention.configure({
    HTMLAttributes: { class: "mention-variable" },
    suggestion: {
      items: ({ query }: { query: string }) => {
        if (!vars?.length) return [];
        const q = query.toLowerCase();
        return vars
          .filter(
            (v) =>
              v.key.toLowerCase().includes(q) ||
              v.label.toLowerCase().includes(q)
          )
          .slice(0, 8)
          .map((v) => ({
            id: v.key,
            label: v.label,
          }));
      },
      render: () => {
        let el: HTMLDivElement | null = null;
        return {
          onStart: (props: any) => {
            el = document.createElement("div");
            el.className = "mention-suggestions";
            updateSuggestion(el, props);
            document.body.appendChild(el);
            positionSuggestion(el, props.clientRect);
          },
          onUpdate: (props: any) => {
            if (!el) return;
            updateSuggestion(el, props);
            positionSuggestion(el, props.clientRect);
          },
          onKeyDown: (props: any) => {
            if (props.event.key === "Escape") {
              props.event.preventDefault();
              props.command("close");
              return true;
            }
            return false;
          },
          onExit: () => {
            if (el) {
              el.remove();
              el = null;
            }
          },
        };
      },
    },
  });
}

function positionSuggestion(el: HTMLElement, rect: DOMRect | null) {
  if (!rect) return;
  el.style.position = "absolute";
  el.style.top = `${rect.bottom + 4}px`;
  el.style.left = `${rect.left}px`;
  el.style.zIndex = "1300";
  el.style.background = "var(--mui-palette-background-paper,#fff)";
  el.style.border = "1px solid var(--mui-palette-divider,rgba(0,0,0,0.12))";
  el.style.borderRadius = "6px";
  el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15),0 0 0 1px rgba(0,0,0,0.04)";
  el.style.minWidth = "220px";
  el.style.fontSize = "0.85rem";
  el.style.padding = "4px";
  el.style.maxHeight = "260px";
  el.style.overflowY = "auto";
}

function updateSuggestion(el: HTMLDivElement, props: any) {
  const { items, command } = props;
  el.innerHTML = "";
  items.forEach((it: any) => {
    const item = document.createElement("div");
    item.textContent = `${it.id} – ${it.label}`;
    item.style.padding = "6px 8px";
    item.style.cursor = "pointer";
    item.style.borderRadius = "4px";
    item.onmousedown = (e) => {
      e.preventDefault();
      command({ id: it.id, label: it.label });
    };
    item.onmouseenter = () => {
      item.style.background = "var(--mui-palette-action-hover,#f5f5f5)";
    };
    item.onmouseleave = () => {
      item.style.background = "transparent";
    };
    el.appendChild(item);
  });
  if (!items.length) {
    const empty = document.createElement("div");
    empty.textContent = "Nenhuma variável";
    empty.style.opacity = "0.6";
    empty.style.padding = "6px 8px";
    el.appendChild(empty);
  }
}

export const SendMessage: React.FC<SendMessageProps> = ({
  participants,
  preselectedIds = [],
  loadingParticipants,
  variables = [
    { key: "nome", label: "Nome do participante" },
    { key: "nomeRetiro", label: "Nome do retiro" },
    { key: "dataInicio", label: "Data início" },
    { key: "dataFim", label: "Data fim" },
    { key: "dataLimiteConfirmacao", label: "Data limite confirmação" },
    { key: "linkConfirmacao", label: "Link confirmação" },
  ],
  defaultMessageTemplate = DEFAULT_TEMPLATE,
  maxVisibleChips = 9,
  onSubmit,
  onCancel,
  //disabled,
}) => {
  const [selected, setSelected] = useState<MessageParticipant[]>([]);
  const [channels, setChannels] = useState({
    whatsapp: true,
    email: true,
    sms: false,
  });
  const [expandedChips, setExpandedChips] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync initial preselected
  useEffect(() => {
    if (participants.length) {
      const pre = participants.filter((p) => preselectedIds.includes(p.id));
      setSelected(pre);
    }
  }, [participants, preselectedIds]);

  // TipTap editor
  const mentionExt = useMemo(
    () => buildMentionExtension(variables),
    [variables]
  );
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, mentionExt],
    content: defaultMessageTemplate,
  }) as Editor | null;

  const allSelectedIds = useMemo(() => selected.map((s) => s.id), [selected]);

  const visibleChips = expandedChips
    ? selected
    : selected.slice(0, maxVisibleChips);

  const overflowCount = selected.length - visibleChips.length;

  const toggleChannel = (key: keyof typeof channels) =>
    setChannels((c) => ({ ...c, [key]: !c[key] }));

  const handleSubmit = useCallback(async () => {
    if (!editor || !selected.length) return;
    setSubmitting(true);
    try {
      const html = editor.getHTML();
      const text = editor.getText();

      await onSubmit?.({
        participantIds: allSelectedIds,
        messageHtml: html,
        messageText: text,
        channels,
      });
    } finally {
      setSubmitting(false);
    }
  }, [editor, selected.length, allSelectedIds, channels, onSubmit]);

  const insertVariable = (key: string) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "mention",
          attrs: { id: key, label: key },
        },
        { type: "text", text: " " },
      ])
      .run();
  };

  const allVariablesRef = useRef<HTMLDivElement | null>(null);

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        p: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* PARTICIPANTS SELECT */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            mb: 0.5,
            display: "block",
          }}
        >
          Selecionados
        </Typography>
        <Autocomplete
          multiple
          options={participants}
          loading={loadingParticipants}
          value={selected}
          onChange={(_, val) => setSelected(val)}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Pesquisar participantes..."
              variant="outlined"
              size="small"
            />
          )}
          renderTags={() => null} // custom chips below
          sx={{
            "& .MuiOutlinedInput-root": {
              flexWrap: "wrap",
              alignItems: "flex-start",
              p: 0.5,
              minHeight: 56,
            },
          }}
        />
        <Box
          sx={{
            mt: 0.5,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            maxHeight: expandedChips ? 160 : 48,
            overflow: "hidden",
            position: "relative",
            pr: 5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
            py: 0.75,
            bgcolor: "action.hover",
          }}
        >
          {visibleChips.map((p) => (
            <Chip
              key={p.id}
              size="small"
              label={p.name}
              onDelete={() =>
                setSelected((s) => s.filter((x) => x.id !== p.id))
              }
              sx={{
                bgcolor: "background.paper",
                "& .MuiChip-deleteIcon": { color: "text.secondary" },
              }}
            />
          ))}
          {overflowCount > 0 && !expandedChips && (
            <Chip
              size="small"
              label={`+${overflowCount}`}
              onClick={() => setExpandedChips(true)}
              sx={{ cursor: "pointer", bgcolor: "background.paper" }}
            />
          )}
          <IconButton
            size="small"
            onClick={() => setExpandedChips((e) => !e)}
            sx={{
              position: "absolute",
              right: 4,
              top: 4,
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
          >
            {expandedChips ? (
              <ExpandLessRoundedIcon fontSize="small" />
            ) : (
              <ExpandMoreRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
        <Collapse in={expandedChips && overflowCount > 0}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            Mostrando todos os {selected.length} participantes.
          </Typography>
        </Collapse>
      </Box>

      {/* MESSAGE FIELD */}
      <Stack spacing={1}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          Mensagem
        </Typography>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            "& .mention-variable": {
              background:
                "color-mix(in srgb, var(--mui-palette-primary-main) 18%, transparent)",
              color: "var(--mui-palette-primary-main)",
              padding: "0 4px",
              borderRadius: 4,
              fontWeight: 500,
            },
            "& .tiptap p": { my: 0.5 },
          }}
        >
          {editor && (
            <RichTextEditorProvider
              editor={editor}
              //   editable={!disabled && !submitting}
              //   slotProps={{
              //     editorContent: {
              //       sx: {
              //         px: 1.25,
              //         py: 1,
              //         minHeight: 160,
              //         fontSize: 14,
              //         outline: "none",
              //         "&:focus": {
              //           boxShadow: "0 0 0 2px var(--mui-palette-primary-main)",
              //         },
              //       },
              //     },
              //   }}
              //extensions={[StarterKit, mentionExt]}
            >
              <RichTextField
                controls={
                  <MenuControlsContainer>
                    <MenuSelectHeading />
                    <MenuDivider />
                    <MenuButtonBold />
                    <MenuButtonItalic />
                    {/* Add more controls of your choosing here */}
                  </MenuControlsContainer>
                }
              />
            </RichTextEditorProvider>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Aperte a tecla <strong>@</strong> dentro da caixa de texto para
          visualizar as variáveis disponíveis.{" "}
          <Link
            component="button"
            type="button"
            onClick={() => {
              if (!editor) return;
              allVariablesRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Ou clique aqui para ver todas as variáveis.
          </Link>
        </Typography>
      </Stack>

      {/* LISTA DE VARIÁVEIS */}
      <Collapse in timeout={300}>
        <Fade in timeout={400}>
          <Stack
            ref={allVariablesRef}
            direction="row"
            flexWrap="wrap"
            gap={1}
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              p: 1,
              borderRadius: 1,
              bgcolor: "background.default",
            }}
          >
            {variables.map((v) => (
              <Chip
                key={v.key}
                size="small"
                label={`@${v.key}`}
                title={v.label}
                onClick={() => insertVariable(v.key)}
                sx={{
                  cursor: "pointer",
                  bgcolor:
                    "color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)",
                }}
              />
            ))}
          </Stack>
        </Fade>
      </Collapse>

      <Divider />

      {/* CHANNELS */}
      <Stack spacing={0.5}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          Meio de envio
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={channels.whatsapp}
                onChange={() => toggleChannel("whatsapp")}
              />
            }
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <WhatsAppIcon fontSize="small" />
                <span>WhatsApp</span>
              </Stack>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={channels.email}
                onChange={() => toggleChannel("email")}
              />
            }
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <EmailRoundedIcon fontSize="small" />
                <span>E-mail</span>
              </Stack>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={channels.sms}
                onChange={() => toggleChannel("sms")}
              />
            }
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <SmsRoundedIcon fontSize="small" />
                <span>SMS</span>
              </Stack>
            }
          />
        </Stack>
      </Stack>

      <Divider />

      {/* ACTIONS */}
      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        <LoadingButton
          variant="outlined"
          startIcon={<CancelRoundedIcon />}
          disabled={submitting}
          onClick={() => onCancel?.()}
        >
          Cancelar
        </LoadingButton>
        <LoadingButton
          variant="contained"
          startIcon={<SendRoundedIcon />}
          loading={submitting}
          disabled={
            submitting ||
            !selected.length ||
            (!channels.whatsapp && !channels.email && !channels.sms) ||
            !editor?.getText().trim()
          }
          onClick={handleSubmit}
        >
          Enviar
        </LoadingButton>
      </Stack>
    </Paper>
  );
};
