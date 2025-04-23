import React, { useEffect, useState } from "react"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"

import { getRoles } from "../api"
import { useSnackBar, useLoading } from "context/GlobalContext"
import { Admin, AdminRole } from "../../../../../types/admin.types"
import AdminTable from "../components/AdminTable"
import Table2 from "../components/Table2"
import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"
import { getPermissions } from "@context/GlobalContext"
import { Permissions } from "../../../../../types/permissions.types"

interface AdminTableProps {
  admins: Admin[]
  loadAdmin: () => Promise<void>
  handleCallback: (page: number) => void
  handleCallback2: (role: AdminRole) => void
  handleCallback3: (admin: Admin) => void
  handleUserAction: (state: string) => void
  setActiveCrud: (state: string) => void
}

export default function ReadAdmins({
  handleCallback,
  handleCallback2,
  handleCallback3,
  setActiveCrud,
  admins,
  loadAdmin,
  handleUserAction,
}: AdminTableProps) {
  const permissions = getPermissions()
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [value, setValue] = useState(0)

  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const loadRoles = async () => {
    setLoading(true)
    try {
      const roles = await getRoles()
      setRoles(roles)
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

  useEffect(() => {
    handleCallback(value)
  }, [value])

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
            <>{children}</>
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
            <Tab label="Administradores" {...a11yProps(0)} />
            <Tab label="Roles" {...a11yProps(1)} />
            {permissions?.modifyAdmins && (
              <div style={{ marginLeft: "auto" }}>
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
              loadAdmin={loadAdmin}
              handleCallback={handleCallback3}
            />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Table2
              roles={roles}
              permissions={permissions}
              loadRoles={loadRoles}
              setActiveCrud={setActiveCrud}
              handleCallback2={handleCallback2}
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
    </React.Fragment>
  )
}
