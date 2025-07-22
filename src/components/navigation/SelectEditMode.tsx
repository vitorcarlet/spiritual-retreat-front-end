import { Select, MenuItem, InputLabel } from "@mui/material";
import { memo } from "react";

type SelectEditModeProps = {
  menuMode: "view" | "edit";
  setMenuMode: (mode: "view" | "edit") => void;
};

const SelectEditMode = ({ menuMode, setMenuMode }: SelectEditModeProps) => (
  <>
    <InputLabel> Modo </InputLabel>
    <Select
      value={menuMode}
      onChange={(e) => setMenuMode(e.target.value as "view" | "edit")}
      displayEmpty
      inputProps={{ "aria-label": "Without label" }}
      label={"Modo"}
      //sx={{ minWidth: 120 }}
    >
      <MenuItem key={1} value={"view"}>
        Visualização
      </MenuItem>
      <MenuItem key={2} value={"edit"}>
        Edição
      </MenuItem>
    </Select>
  </>
);

export default memo(SelectEditMode);
