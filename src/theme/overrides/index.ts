import { Theme } from "@mui/material";
import Button from "./Button";
import List from "./List";
//import Select from "./Select";

function ComponentsOverrides(theme: Theme) {
  return Object.assign(Button(theme), List(theme));
}

export default ComponentsOverrides;
