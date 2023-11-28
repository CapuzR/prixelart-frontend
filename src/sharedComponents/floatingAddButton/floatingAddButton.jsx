import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";
import ShoppingCartOutlinedIcon from "@material-ui/icons/ShoppingCartOutlined";
import LocalActivityIcon from "@material-ui/icons/LocalActivity";
import Badge from "@material-ui/core/Badge";
import NotificationsIcon from "@material-ui/icons/Notifications";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      top: "auto",
      bottom: 20,
      left: "auto",
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

  const openServiceDialog = () => {
    props.setOpenServiceFormDialog(true);
  };

  const openShoppingCart = () => {
    props.setOpenShoppingCart(true);
  };

  return (
    <div className={classes.root}>
      {JSON.parse(localStorage.getItem("token")) &&
        JSON.parse(localStorage.getItem("token")).username && (
          <>
            <Fab
              color="primary"
              aria-label="add"
              onClick={openServiceDialog}
              style={{
                bottom:
                  JSON.parse(localStorage.getItem("buyState")) &&
                  JSON.parse(localStorage.getItem("buyState"))?.length > 0
                    ? 160
                    : 70,
                right: 10,
              }}
            >
              <LocalActivityIcon />
            </Fab>

            <Fab
              color="primary"
              aria-label="add"
              onClick={openArtDialog}
              style={{
                bottom:
                  JSON.parse(localStorage.getItem("buyState")) &&
                  JSON.parse(localStorage.getItem("buyState"))?.length > 0
                    ? 90
                    : 0,
                right: 10,
              }}
            >
              <AddPhotoAlternateIcon />
            </Fab>
          </>
        )}
      {JSON.parse(localStorage.getItem("buyState")) &&
        JSON.parse(localStorage.getItem("buyState"))?.length > 0 && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={openShoppingCart}
            style={{ right: 10 }}
          >
            <Badge
              overlap="rectangular"
              badgeContent={
                JSON.parse(localStorage.getItem("buyState"))?.length
              }
              color="white"
            >
              <ShoppingCartOutlinedIcon />
            </Badge>
          </Fab>
        )}
    </div>
  );
}
