import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import clsx from "classnames";
import makeStyles from "@mui/styles/makeStyles";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import CreateConsumer from "../../consumerCrud/createConsumer";
import UpdateConsumer from "../../consumerCrud/updateConsumer";
import ReadConsumers from "../../consumerCrud/readConsumers";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    marginLeft: 30,
    padding: theme.spacing(2),
    marginRight: -20,
    display: "flex",
    overflow: "none",
    flexDirection: "column",
  },
  fixedHeight: {
    height: "auto",
    overflow: "none",
  },
  fab: {
    right: 0,
    position: "absolute",
  },
}));

export default function Consumers(props) {
  const classes = useStyles();
  const history = useNavigate();
  const location = useLocation();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [activeCrud, setActiveCrud] = useState("read");
  const [consumer, setConsumer] = useState();
  const [consumerEdit, setConsumerEdit] = useState(true);

  const handleConsumerAction = (action) => {
    history.push({ pathname: "/admin/consumer/" + action });
  };

  useEffect(() => {
    location.pathname.split("/").length === 5
      ? setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 2]
        )
      : location.pathname.split("/").length === 4 &&
        setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 1]
        );
  }, [location.pathname]);

  return (
    <div style={{ position: "relative" }}>
      {consumerEdit && (
        <div style={{ position: "absolute", right: 10, top: 20 }}>
          <Fab
            color="default"
            aria-label="edit"
            onClick={() => {
              handleConsumerAction("read");
            }}
            style={{ right: 10 }}
          >
            <ViewListIcon />
          </Fab>
          {props?.permissions?.createConsumer && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                handleConsumerAction("create");
              }}
            >
              <AddIcon />
            </Fab>
          )}
        </div>
      )}
      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={fixedHeightPaper}>
            {activeCrud === "create" ? (
              <CreateConsumer />
            ) : activeCrud === "read" ? (
              <ReadConsumers
                setConsumer={setConsumer}
                permissions={props.permissions}
              />
            ) : (
              // : activeCrud == 'update' ?
              <div>
                <UpdateConsumer
                  consumer={consumer}
                  setConsumerEdit={setConsumerEdit}
                />
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
