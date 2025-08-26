import React from "react";
import "./loading.css";
import { Box } from "@mui/material";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  color?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "medium",
  color,
  text = "Loading...",
}) => {
  const sizeClasses = {
    small: "loading-small",
    medium: "loading-medium",
    large: "loading-large",
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <div className="loading-container">
        <div
          className={`loading-spinner ${sizeClasses[size]}`}
          style={{ borderTopColor: color || "var(--mui-palette-primary-main)" }}
        />
      </div>

      {text && <p className="loading-text">{text}</p>}
    </Box>
  );
};

export default Loading;
