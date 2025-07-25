import React from "react";
import "./loading.css";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  color?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "medium",
  color = "#3498db",
  text = "Loading...",
}) => {
  const sizeClasses = {
    small: "loading-small",
    medium: "loading-medium",
    large: "loading-large",
  };

  return (
    <div className="loading-container">
      <div
        className={`loading-spinner ${sizeClasses[size]}`}
        style={{ borderTopColor: color }}
      />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
