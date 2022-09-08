import { React, useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
// import TextField from "@material-ui/core/TextField";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  loading: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
    marginLeft: "50vw",
    marginTop: "50vh",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    width: "100%",
  },
}));

export default function Testimonials(props) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(0);

  const setValueText = (event) => {
    setValue(event.target.value);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress />
      </Backdrop>
      <Paper className={classes.paper}>
        <AppBar position="static">
          <Tabs value={value} onChange={handleChange}>
            <Tab
              label="Testimonios"
              aria-selected="true"
              style={{ marginLeft: "30px" }}
            />
          </Tabs>
        </AppBar>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              style={{ width: "100%", padding: "24px", textAlign: "justify" }}
            >
              <Paper padding={"24px"} className={classes.paper}>
                <Button variant="outlined" color="primary" paddingBottom={4}>
                  Crear testimonio
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
