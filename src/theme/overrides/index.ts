import { Theme } from "@mui/material/styles";
import Button from "./Button";
import List from "./List";

function ComponentsOverrides(theme: Theme) {
  return Object.assign(Button(theme), List(theme));
}

export default ComponentsOverrides;
