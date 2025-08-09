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
};

const SearchField = ({
  value,
  onChange,
  placeholder,
  sx,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onChange ? onChange(textRef.current?.value || "") : null;
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
  // Auto-resize width based on text length
  const inputWidth = Math.max(150, localValue.length * 12 + 40); // min 150px, 12px per char, +40 for icon/padding

  return (
    <TextField
      sx={{
        ...sx,
        width: inputWidth,
        transition: "width 0.2s",
      }}
      inputRef={textRef}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleBlur();
        }
      }}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      fullWidth={false}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="lucide:search" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchField;
