import { useEffect, useState } from "react"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import Fab from "@mui/material/Fab"
import IconButton from "@mui/material/IconButton"

import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"

import { useHistory, useLocation } from "react-router-dom"

import CreateAdmin from "../../adminCrud/createAdmin"
import ReadAdmins from "../../adminCrud/adminCrud"
import UpdateAdmin from "../../adminCrud/updateAdmin"
import CreateAdminRole from "../../adminCrud/createAdminRole"
import UpdateAdminRole from "../../adminCrud/updateAdminRole"

import { getAdmins } from "./api"

import { Admin } from "./../../../../types/admin.types"

import { useSnackBar, useLoading } from "context/GlobalContext"

const drawerWidth = 240

const useStyles = makeStyles()((theme: Theme) => {
  return {
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
      padding: theme.spacing(5),
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
  }
})

export default function AdminUsers({ permissions }) {
  const { classes, cx } = useStyles()
  const location = useLocation()
  const history = useHistory()
  const fixedHeightPaper = cx(classes.paper)
  const [activeCrud, setActiveCrud] = useState("read")
  const [page, setPage] = useState(0)
  const [admin, setAdmin] = useState<Partial<Admin>>()
  const [admins, setAdmins] = useState()
  // const globalParams = window.location.pathname;
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  useEffect(() => {
    loadAdmin()
  }, [])

  const loadAdmin = async () => {
    setLoading(true)
    try {
      const admins = await getAdmins()
      setAdmins(admins)
    } catch (error) {
      showSnackBar(
        "Error obteniendo lista de administradores, por favor inténtelo de nuevo."
      )
      console.error("Error obteniendo listado de administradores:", error)
    }
  }

  const handleUserAction = (action: string) => {
    if (action === "create" && page === 0) {
      setActiveCrud("create")
      history.push("/admin/user/" + action)
    } else if (action === "create" && page === 1) {
      setActiveCrud("createRole")
      // history.push("/admin/user/createRole");
    } else {
      history.push("/admin/user/" + action)
      setActiveCrud(action)
    }
  }

  useEffect(() => {
    location.pathname.split("/").length === 5
      ? setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 2]
        )
      : location.pathname.split("/").length === 4 &&
        setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 1]
        )
  }, [location.pathname])

  const updateAdminProperty = (property: any, value: string) => {
    if (property === "all") {
      setAdmin({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        area: "",
        isSeller: false,
      })
    } else {
      setAdmin((prevAdmin) => ({
        ...prevAdmin,
        [property]: value,
      }))
    }
  }

  function Callback(childData) {
    setPage(childData)
  }

  function Callback2(childData) {
    setAdmin(childData)
  }

  return (
    <div style={{ position: "relative" }}>
      {/* {permissions?.modifyAdmins && (
        <div style={{ position: "absolute", right: 10, top: 10 }}>
          <Fab
            color="default"
            aria-label="edit"
            onClick={() => {
              handleUserAction("read")
            }}
            style={{ right: 10 }}
          >
            <ViewListIcon />
          </Fab>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              handleUserAction("create")
            }}
          >
            <AddIcon />
          </Fab>
        </div>
      )} */}
      <Grid2 container spacing={4}>
        <Grid2 size={{ xs: 12, md: 12, lg: 12 }}>
          <Paper className={fixedHeightPaper}>
            {activeCrud === "create" ? (
              <CreateAdmin loadAdmin={loadAdmin} />
            ) : activeCrud === "read" ? (
              <ReadAdmins
                handleCallback={Callback}
                setActiveCrud={setActiveCrud}
                handleCallback2={Callback2}
                permissions={permissions}
                admins={admins}
                loadAdmin={loadAdmin}
                handleUserAction={handleUserAction}
              />
            ) : activeCrud === "update" ? (
              <UpdateAdmin
                admin={admin}
                updateAdminProperty={updateAdminProperty}
                loadAdmin={loadAdmin}
              />
            ) : activeCrud === "createRole" ? (
              <CreateAdminRole  setActiveCrud={setActiveCrud} />
            ) : activeCrud === "updateRole" ? (
              <UpdateAdminRole admin={admin} setActiveCrud={setActiveCrud} />
            ) : (
              <></>
              // <DisableAdmin />
            )}
          </Paper>
        </Grid2>
      </Grid2>
    </div>
  )
}
