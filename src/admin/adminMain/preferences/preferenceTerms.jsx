import React from "react";
import { useState, useEffect } from "react";
import Backdrop from "@material-ui/core/Backdrop";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

export default function Terms() {
  const classes = useStyles();
  const [TermsState, setTermsState] = useState("read");
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <div className={classes.root}>
      {/*<Button variant="outlined" color="primary" onClick={handleToggle}>
        Show backdrop
      </Button>*/}
      <Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Paper className={classes.paper}>
        {TermsState === "read" && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box style={{ width: "100%" }}>
                <Box>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ut
                  urna elementum, efficitur lacus vel, vestibulum felis. Cras
                  aliquet ornare velit vel consequat. Cras et scelerisque diam.
                  Morbi rhoncus tempor ipsum in hendrerit. Aenean dolor orci,
                  consectetur sed rhoncus sit amet, pellentesque non nibh. Morbi
                  quis lorem mauris. Interdum et malesuada fames ac ante ipsum
                  primis in faucibus. Nulla ut egestas dui. Morbi ac urna nisi.
                  Nam at ultrices leo, nec ullamcorper est. Nunc justo metus,
                  scelerisque sed purus quis, hendrerit auctor enim. Donec non
                  porttitor velit, porta semper dui.{" "}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </div>
  );
}
