import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minWidth: "100%",
    alignItems: "center",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  paper: {
    textAlign: "center",
  },
}));

export default function BasicButtonGroup() {
  const classes = useStyles();
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <div className={classes.root}>
      <Paper
        className={classes.paper}
        style={{ width: isDesktop ? "50%" : "100%" }}
      >
        <ButtonGroup
          variant="text"
          color="primary"
          aria-label="text primary button group"
        >
          <Button>Artes</Button>
          {/* <Button>Servicios</Button> */}
        </ButtonGroup>
      </Paper>
    </div>
  );
}
