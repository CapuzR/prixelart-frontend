import React from "react";
import styles from "./ActionBar.module.scss";
import Grid2 from "@mui/material/Grid";

type OnlyUpperProps = {
  onUpperAction: (() => void) | undefined;
  upperIcon: React.ReactNode;
  onLowerAction?: never;
  lowerIcon?: never;
};

type OnlyLowerProps = {
  onLowerAction: (() => void) | undefined;
  lowerIcon: React.ReactNode;
  onUpperAction?: never;
  upperIcon?: never;
};

type BothActionsProps = {
  onUpperAction: () => void;
  upperIcon: React.ReactNode;
  onLowerAction: () => void;
  lowerIcon: React.ReactNode;
};

type ActionBarProps = OnlyUpperProps | OnlyLowerProps | BothActionsProps;

const ActionBar: React.FC<ActionBarProps> = ({
  onUpperAction,
  onLowerAction,
  upperIcon,
  lowerIcon,
}) => {
  return (
    <Grid2
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        // height: "100%",
        width: "60px",
        backgroundColor: "transparent",
        right: 0,
      }}
    >
      {onUpperAction && upperIcon && (
        <Grid2 className={styles["icon-wrapper"]} onClick={onUpperAction}>
          {upperIcon}
        </Grid2>
      )}
      {onLowerAction && lowerIcon && (
        <Grid2 className={styles["icon-wrapper"]} onClick={onLowerAction}>
          {lowerIcon}
        </Grid2>
      )}
    </Grid2>
  );
};

export default ActionBar;
