import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Backdrop from "@material-ui/core/Backdrop";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";
import TextEditor from "./TextEditorDraft";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "100%",
      height: "100%",
    },
  },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    width: "100%",
  },
}));

export default function MultilineTextFields(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState("");

  const handleChange = async (event) => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/update";
    const response = await axios.put(base_url, { termsAndConditions: value });
  };
  const setValueText = (event) => {
    setValue(event.target.value);
  };

  useEffect(() => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
    axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [state, setState] = React.useState({
    open: false,
    vertical: "top",
    horizontal: "center",
  });

  const { vertical, horizontal, open } = state;

  const handleClick = (newState) => () => {
    setState({ open: true, ...newState });
    handleChange();
  };

  const handleClose = () => {
    setState({ ...state, open: false });
  };

  const buttons = (
    <React.Fragment>
      <Button
        variant="outlined"
        color="primary"
        style={{ margin: "14px 30px" }}
        onClick={handleClick({ vertical: "bottom", horizontal: "right" })}
      >
        Actualizar
      </Button>
    </React.Fragment>
  );

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Paper className={classes.paper}>
        {
          <Grid container spacing={2}>
            {buttons}
            <Grid item xs={12}>
              <Box
                style={{
                  width: "100%",
                  padding: "15px",
                  textAlign: "justify",
                }}
              >
                <Box>
                  <TextField
                    id="outlined-multiline-static"
                    label="Multiline"
                    multiline
                    rows={16}
                    value={value}
                    onChange={setValueText}
                    variant="outlined"
                  />
                </Box>

                {/* <Box>
                  <TextEditor />
                </Box> */}
              </Box>
            </Grid>
          </Grid>
          //)
        }
      </Paper>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        message="Los términos y condiciones fueron actualizados!"
        key={vertical + horizontal}
      />
    </div>
  );
}
