import React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import makeStyles from '@mui/styles/makeStyles';
import Paper from "@mui/material/Paper";

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
