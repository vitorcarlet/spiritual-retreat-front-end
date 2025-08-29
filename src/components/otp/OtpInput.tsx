"use client";
import { Box, TextField } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { FieldError } from "react-hook-form";

interface OtpInputProps {
  length: number;
  onChange: (otp: string) => void;
  error?: FieldError;
  disabled?: boolean;
  valueRef?: React.RefObject<string>;
  value?: string;
}

export const OtpInput = ({
  length,
  onChange,
  error,
  disabled,
  valueRef,
  value,
}: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    onChange(otp.join(""));
  }, [otp, onChange]);

  useEffect(() => {
    if (value) {
      const valueArray = value.split("").slice(0, length);
      const newOtp = [...otp];
      for (let i = 0; i < length; i++) {
        newOtp[i] = valueArray[i] || "";
      }
      setOtp(newOtp);
    }
  }, [value]);

  useEffect(() => {
    if (valueRef) {
      valueRef.current = otp.join("");
    }
  }, [otp]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Mover para o próximo input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    if (paste.length === length && /^\d+$/.test(paste)) {
      const newOtp = paste.split("");
      setOtp(newOtp);
      inputRefs.current[length - 1]?.focus();
    }
  };
  return (
    <Box
      sx={{
        width: "fit-content",
        height: "fit-content",
        display: "flex",
        gap: 1,
        justifyContent: "center",
      }}
    >
      {otp.map((value, index) => (
        <TextField
          key={index}
          inputRef={(el) => (inputRefs.current[index] = el)}
          value={value}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          slotProps={{
            htmlInput: {
              maxLength: 1,
              style: {
                textAlign: "center",
                fontSize: 24,
                fontWeight: "bold",
              },
            },
          }}
          sx={{
            width: 56,
            // height: 56,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: error ? "error.main" : "primary.main",
                borderWidth: 2,
              },
              "&:hover fieldset": {
                borderColor: error ? "error.main" : "primary.dark",
              },
              "&.Mui-focused fieldset": {
                borderColor: error ? "error.main" : "primary.main",
              },
            },
          }}
          error={error?.message ? true : false}
        />
      ))}
    </Box>
  );
};
