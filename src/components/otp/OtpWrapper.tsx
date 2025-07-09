import { styled } from "@mui/material";

const OtpWrapper = styled("div")(({ theme }) => ({
  display: "inline-flex",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    borderColor: theme.palette.text.primary,
  },
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
    borderWidth: "2px",
    padding: `calc(${theme.spacing(1)} - 1px)`, // Compensate for thicker border
  },
  "& .MuiInputBase-input": {
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
  },
}));

export default OtpWrapper;
