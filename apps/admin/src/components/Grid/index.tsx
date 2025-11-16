import React from "react";
import styles from "./styles.module.scss";

interface GridProps {
  children: React.ReactNode;
  isParent?: boolean;
  className?: string;
}

const Grid: React.FC<GridProps> = ({
  children,
  isParent = false,
  className = "",
}) => {
  return (
    <div
      className={
        isParent
          ? `${styles["grid-container"]} ${className}`
          : `${styles["grid-item"]} ${className}`
      }
    >
      {children}
    </div>
  );
};

export default Grid;
