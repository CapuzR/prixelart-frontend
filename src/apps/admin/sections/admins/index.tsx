import { useEffect, useState } from "react"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"

import { useNavigate, useLocation } from "react-router-dom"

import CreateAdmin from "./views/Create"
import ReadAdmins from "./views/Read"
import UpdateAdmin from "./views/Update"
import CreateAdminRole from "./views/CreateRole"
import UpdateAdminRole from "./views/UpdateRole"

import { getAdmins } from "./api"

import { Admin, AdminRole } from "../../../../types/admin.types"

import { useSnackBar, useLoading } from "context/GlobalContext"
import { AdminFormProvider } from "@context/AdminFormContext"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      padding: theme.spacing(5),
      display: "flex",
      overflow: "auto",
      flexDirection: "column",
    },
  }
})

export default function AdminCrud() {
  const { classes, cx } = useStyles()
  const location = useLocation()
  const navigate = useNavigate()
  const fixedHeightPaper = cx(classes.paper)
  const [activeCrud, setActiveCrud] = useState("read")
  const [page, setPage] = useState(0)
  const [admin, setAdmin] = useState<Partial<Admin>>()
  const [role, setRole] = useState<Partial<AdminRole>>()
  const [admins, setAdmins] = useState<Admin[]>([])
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  useEffect(() => {
    loadAdmin()
  }, [])

  const loadAdmin = async () => {
    setLoading(true)
    try {
      const response = await getAdmins()
      setAdmins(response)
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
      navigate("/admin/admins/" + action)
    } else if (action === "create" && page === 1) {
      setActiveCrud("createRole")
    } else {
      navigate("/admin/admins/" + action)
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

  const updateAdminProperty = (property: string, value: string | boolean) => {
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

  function Callback(childData: number) {
    setPage(childData)
  }

  function Callback2(childData: AdminRole) {
    setRole(childData)
  }

  function Callback3(childData: Admin) {
    setAdmin(childData)
  }

  return (
    <div style={{ position: "relative" }}>
      <Grid2 container spacing={4}>
        <Grid2 size={{ xs: 12, md: 12, lg: 12 }}>
          <Paper className={fixedHeightPaper}>
            <AdminFormProvider>
              {activeCrud === "create" ? (
                <CreateAdmin loadAdmin={loadAdmin} />
              ) : activeCrud === "read" ? (
                <ReadAdmins
                  handleCallback={Callback}
                  setActiveCrud={setActiveCrud}
                  admins={admins}
                  loadAdmin={loadAdmin}
                  handleUserAction={handleUserAction}
                  handleCallback2={Callback2}
                  handleCallback3={Callback3}
                />
              ) : activeCrud === "update" ? (
                <UpdateAdmin
                  admin={admin}
                  updateAdminProperty={updateAdminProperty}
                  loadAdmin={loadAdmin}
                />
              ) : activeCrud === "createRole" ? (
                <CreateAdminRole setActiveCrud={setActiveCrud} />
              ) : activeCrud === "updateRole" ? (
                <UpdateAdminRole role={role} />
              ) : (
                <></>
              )}
            </AdminFormProvider>
          </Paper>
        </Grid2>
      </Grid2>
    </div>
  )
}
