import { Theme } from "@mui/material/styles";
import Button from "./Button";

function ComponentsOverrides(theme: Theme) {
  return Object.assign(Button(theme));
}

export default ComponentsOverrides;
