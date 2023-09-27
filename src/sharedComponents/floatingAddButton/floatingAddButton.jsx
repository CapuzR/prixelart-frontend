import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import Fab from "@mui/material/Fab";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      // marginRight: theme.spacing(1),

      // margin: 0,
      top: "auto",
      // marginLeft: 333,
      bottom: 20,
      left: "auto",
      // paddingRight: "5",
      position: "fixed",
    },
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  uwStyles: {
    palette: {
      window: "#ffffff",
      sourceBg: "#f4f4f5",
      windowBorder: "#90a0b3",
      tabIcon: "#000000",
      inactiveTabIcon: "#d33f49",
      menuIcons: "#555a5f",
      link: theme.palette.primary.main,
      action: "#339933",
      inProgress: theme.palette.primary.main,
      complete: "#339933",
      error: "#cc0000",
      textDark: "#000000",
      textLight: "#fcfffd",
    },
    fonts: {
      default: null,
      "sans-serif": {
        url: null,
        active: true,
      },
    },
  },
}));

export default function FloatingAddButton(props) {
  const classes = useStyles();

  const openArtDialog = () => {
    props.setOpenArtFormDialog(true);
  };

  const openShoppingCart = () => {
    props.setOpenShoppingCart(true);
  };

  return (
    <div className={classes.root}>
      {JSON.parse(localStorage.getItem("token")) &&
        JSON.parse(localStorage.getItem("token")).username && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={openArtDialog}
            style={{ bottom: 90, right: 10 }}
          >
            <AddPhotoAlternateIcon />
          </Fab>
        )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={openShoppingCart}
        style={{ right: 10 }}
      >
        <ShoppingCartOutlinedIcon />
      </Fab>
    </div>
  );
}
