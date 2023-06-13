import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";
import CreateAdmin from "../../adminCrud/createAdmin";
import ReadAdmins from "../../adminCrud/readAdmins";
import UpdateAdmin from "../../adminCrud/updateAdmin";
import DisableAdmin from "../../adminCrud/disableAdmin";
import CreateAdminRole from "../../adminCrud/createAdminRole";
import UpdateAdminRole from "../../adminCrud/updateAdminRole";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    gridTemplateColumn: "4",
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
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 700,
  },
  fab: {
    right: 0,
    position: "absolute",
  },
}));

export default function AdminUsers(props) {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const fixedHeightPaper = clsx(classes.paper);
  const [activeCrud, setActiveCrud] = useState("read");
  const [page, setPage] = useState(0);
  const [admin, setAdmin] = useState();

  const handleUserAction = (action) => {
    history.push("/admin/user/" + action);
    setActiveCrud(action);
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

  function Callback(childData) {
    setPage(childData);
  }

  function Callback2(childData) {
    setAdmin(childData);
  }
  return (
    <div style={{ position: "relative" }}>
      {props.permissions?.modifyAdmins && (
        <div style={{ position: "absolute", right: 10, top: 20 }}>
          <Fab
            color="default"
            aria-label="edit"
            onClick={() => {
              handleUserAction("read");
            }}
            style={{ right: 10 }}
          >
            <ViewListIcon />
          </Fab>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              page === 0
                ? handleUserAction("create")
                : handleUserAction("createRole");
            }}
          >
            <AddIcon />
          </Fab>
        </div>
      )}
      <Grid container spacing={4}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={fixedHeightPaper}>
            {activeCrud === "create" ? (
              <CreateAdmin />
            ) : activeCrud === "read" ? (
              <ReadAdmins
                handleCallback={Callback}
                setActiveCrud={setActiveCrud}
                handleCallback2={Callback2}
                permissions={props.permissions}
              />
            ) : activeCrud === "update" ? (
              <UpdateAdmin admin={admin} />
            ) : activeCrud === "createRole" ? (
              <CreateAdminRole />
            ) : activeCrud === "updateRole" ? (
              <UpdateAdminRole admin={admin} />
            ) : (
              <DisableAdmin />
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
