import React from "react";
import styles from "./Button.module.scss"; // Assuming you're using SCSS for styling

interface ButtonProps {
  type?: "filled" | "bordered" | "onlyText";
  color?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  highlighted?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = "filled",
  color = "primary",
  disabled = false,
  loading = false,
  highlighted = false,
  onClick,
  children,
  className = "",
}) => {
  const buttonClass = `${styles["btn"]}
    ${styles[type]}
    ${styles[color]}
    ${highlighted ? styles["highlighted"] : ""}
    ${disabled ? styles["disabled"] : ""}
    ${className}`;

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <span className="spinner"></span> : children}
    </button>
  );
};

export default Button;
