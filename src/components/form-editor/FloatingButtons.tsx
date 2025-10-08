import { Box, Tooltip, Fab } from "@mui/material";
import TitleIcon from "@mui/icons-material/Title";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import PersonIcon from "@mui/icons-material/Person";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { BaseFieldType } from "./types";

interface FloatingButtonsProps {
  onAddField: (type: BaseFieldType) => void;
}

export default function FloatingButtons({ onAddField }: FloatingButtonsProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        right: 16,
        top: 16,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Tooltip title="Campo de Texto" placement="left">
        <Fab size="small" color="primary" onClick={() => onAddField("text")}>
          <TitleIcon fontSize="small" />
        </Fab>
      </Tooltip>
      <Tooltip title="Texto Especial" placement="left">
        <Fab
          size="small"
          color="primary"
          onClick={() => onAddField("textSpecial")}
        >
          <PersonIcon fontSize="small" />
        </Fab>
      </Tooltip>
      <Tooltip title="Opção Única" placement="left">
        <Fab size="small" color="primary" onClick={() => onAddField("radio")}>
          <RadioButtonCheckedIcon fontSize="small" />
        </Fab>
      </Tooltip>
      <Tooltip title="Lista de Verificação" placement="left">
        <Fab
          size="small"
          color="primary"
          onClick={() => onAddField("checkbox")}
        >
          <ListAltIcon fontSize="small" />
        </Fab>
      </Tooltip>
      <Tooltip title="Interruptor" placement="left">
        <Fab size="small" color="primary" onClick={() => onAddField("switch")}>
          <ToggleOnIcon fontSize="small" />
        </Fab>
      </Tooltip>
      <Tooltip title="Photo" placement="left">
        <Fab size="small" color="primary" onClick={() => onAddField("photo")}>
          <PhotoCameraIcon fontSize="small" />
        </Fab>
      </Tooltip>
      <Tooltip title="Sim/Não Expansível" placement="left">
        <Fab
          size="small"
          color="primary"
          onClick={() => onAddField("switchExpansible")}
        >
          <UnfoldMoreIcon fontSize="small" />
        </Fab>
      </Tooltip>
      <Tooltip title="Campos Especiais" placement="left">
        <Fab
          size="small"
          color="primary"
          onClick={() => onAddField("textSpecial")}
        >
          <TextFieldsIcon fontSize="small" />
        </Fab>
      </Tooltip>
    </Box>
  );
}
