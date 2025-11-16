import React from "react";
import classNames from "classnames";
import styles from "./styles.module.scss";

interface TypographyProps {
  level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  align?: "left" | "center" | "right" | "justify";
  color?: string;
  leading?: "tight" | "normal" | "loose";
  tracking?: "tight" | "normal" | "wide";
  kerning?: "tight" | "normal" | "wide";
  children: React.ReactNode;
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({
  level,
  align = "left",
  color,
  leading = "normal",
  tracking = "normal",
  kerning = "normal",
  children,
  className,
}) => {
  const Tag = level;

  return (
    <Tag
      className={classNames(
        styles.typography,
        styles[level],
        styles[align],
        className,
        styles[`leading-${leading}`],
        styles[`tracking-${tracking}`],
        styles[`kerning-${kerning}`],
      )}
      style={{ color: color ? color : "inherit" }}
    >
      {children}
    </Tag>
  );
};

export default Typography;
