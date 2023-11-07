import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minWidth: "100%",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
    // "& > *": {
    //   margin: theme.spacing(1),
    // },
  },
  paper: {
    width: "100%",
    display: "flex",
    justifyContent: "space-evenly",
    maxWidth: "400px",
    // color: "primary",
  },
}));

export default function BasicButtonGroup(props) {
  const classes = useStyles();

  const changeFeed = (op) => {
    props.setFeed(op);
  };
  return (
    <Grid container className={classes.root}>
      <Grid
        item
        xs={12}
        sm={12}
        style={{
          width: "100%",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Paper className={classes.paper}>
          <Button
            onClick={(e) => {
              changeFeed("Artes");
            }}
            color="primary"
          >
            Artes
          </Button>
          <Button
            onClick={(e) => {
              changeFeed("Servicios");
            }}
            color="primary"
          >
            Servicios
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}
