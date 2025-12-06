import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import Iconify from "../Iconify";
import { SxProps, Theme } from "@mui/material";

type SearchFieldProps = {
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
  multiline?: boolean;
};

const SearchField = ({
  value,
  onChange,
  placeholder,
  sx,
  fullWidth = false,
  multiline = false,
}: SearchFieldProps) => {
  const [localValue, setLocalValue] = useState(value ? value.toString() : "");

  const hasChangesRef = useRef<boolean>(false);
  const textRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    hasChangesRef.current = true;
  };
  const handleBlur = () => {
    if (hasChangesRef.current) {
      onChange?.(textRef.current?.value || "");
      hasChangesRef.current = false;
    }
  };

  const handleFocus = () => {
    hasChangesRef.current = false;
  };

  useEffect(() => {
    setLocalValue(
      (value as string) || (textRef.current?.value as string) || ""
    );
  }, [value]);

  return (
    <TextField
      sx={{
        width: fullWidth ? "100%" : "auto",
        "& .MuiOutlinedInput-root": {
          minHeight: 40,
          alignItems: multiline ? "flex-start" : "center",
        },
        ...sx,
      }}
      inputRef={textRef}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          handleBlur();
        }
      }}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      fullWidth={fullWidth}
      multiline={multiline}
      maxRows={4}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{
                alignSelf: "center",
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Iconify icon="lucide:search" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchField;
