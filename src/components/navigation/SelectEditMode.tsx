"use client";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { memo } from "react";

type SelectEditModeProps = {
  menuMode: "view" | "edit" | null;
  setMenuMode: (mode: "view" | "edit" | null) => void;
  isAllowedToEdit: boolean;
};

const SelectEditMode = ({
  menuMode,
  setMenuMode,
  isAllowedToEdit,
}: SelectEditModeProps) => (
  <div>
    <FormControl variant="outlined">
      <InputLabel id="select-edit-mode-label">Modo</InputLabel>
      <Select
        labelId="select-edit-mode-label"
        value={menuMode || ""}
        onChange={(e) => setMenuMode(e.target.value as "view" | "edit")}
        label="Modo" // ✅ CORREÇÃO: Adicionar esta prop
        sx={{ minWidth: 150 }}
      >
        <MenuItem key={1} value={"view"}>
          Visualização
        </MenuItem>
        <MenuItem key={2} value={"edit"} disabled={!isAllowedToEdit}>
          Edição
        </MenuItem>
      </Select>
    </FormControl>
  </div>
);

export default memo(SelectEditMode);
