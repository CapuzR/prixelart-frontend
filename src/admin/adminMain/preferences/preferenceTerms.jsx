import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Backdrop from "@material-ui/core/Backdrop";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";
import MDEditor from "@uiw/react-md-editor";

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
  const [value, setValue] = useState("");

  const handleChange = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/update";
    const response = await axios.put(base_url, {
      termsAndConditions: value,
    });
  };

  useEffect(() => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
    axios
      .get(base_url)
      .then((response) => {
        const result = response.data.terms.termsAndConditions;
        setValue(result);
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
              <div
                style={{
                  width: "100%",
                  padding: "15px",
                  textAlign: "justify",
                  padding: "2px",
                  minHeight: "400px",
                }}
                data-color-mode="light"
              >
                <MDEditor
                  value={value}
                  onChange={setValue}
                  style={{ minHeight: "600px", height: "600px" }}
                />
                <MDEditor.Markdown
                  source={value}
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
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
