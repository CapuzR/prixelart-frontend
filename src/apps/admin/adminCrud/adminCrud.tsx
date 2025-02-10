import React, { useEffect, useState } from "react"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"

import { getRoles } from "./api"
import { useSnackBar, useLoading } from "context/GlobalContext"
import { AdminRole } from "../../../types/admin.types"
import AdminTable from "./adminTable"
import Table2 from "./table-2"
import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"

export default function ReadAdmins({
  handleCallback,
  setActiveCrud,
  handleCallback2,
  permissions,
  admins,
  loadAdmin,
  handleUserAction
}) {
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [value, setValue] = useState(0)
  const globalParams = window.location.pathname
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const loadRoles = async () => {
    setLoading(true)
    try {
      const roles = await getRoles()
      if (globalParams === "/admin/user/read") {
        setRoles(roles)
      }
    } catch (error) {
      showSnackBar(
        "Error obteniendo lista de roles, por favor inténtelo de nuevo."
      )
      console.error("Error obteniendo listado de roles:", error)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    )
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    }
  }

  return (
    <React.Fragment>
      {permissions?.modifyAdmins ? (
        <>
          <Tabs value={value} onChange={handleChange}>
            <Tab
              label="Administradores"
              {...a11yProps(0)}
            />
            <Tab label="Roles" {...a11yProps(1)} />
            {permissions?.modifyAdmins && (
              <div style={{ marginLeft: "auto" }}>
                <IconButton
                  aria-label="edit"
                  onClick={() => {
                    handleUserAction("read")
                  }}
                  style={{ right: 10 }}
                >
                  <ViewListIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  aria-label="add"
                  onClick={() => {
                    handleUserAction("create")
                  }}
                >
                  <AddIcon />
                </IconButton>
              </div>
            )}
          </Tabs>
          <TabPanel value={value} index={0}>
            <AdminTable
              admins={admins}
              permissions={permissions}
              handleCallback2={handleCallback2}
              loadAdmin={loadAdmin}
            />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Table2
              roles={roles}
              permissions={permissions}
              loadRoles={loadRoles}
              handleCallback2={handleCallback2}
              setActiveCrud={setActiveCrud}
            />
          </TabPanel>
        </>
      ) : (
        <Typography
          variant="h3"
          color="secondary"
          align="center"
          style={{ paddingTop: 30, marginTop: 60, marginBottom: 80 }}
        >
          No tienes permiso para entrar a esta área.
        </Typography>
      )}
      {/* {up && <UpdateAdmin admin={up} />} */}
      {handleCallback(value)}
    </React.Fragment>
  )
}
