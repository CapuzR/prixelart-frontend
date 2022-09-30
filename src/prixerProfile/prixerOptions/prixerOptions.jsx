import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

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
    width: "100%",
    textAlign: "center",
  },
}));

export default function BasicButtonGroup() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} style={{ width: "400px" }}>
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
