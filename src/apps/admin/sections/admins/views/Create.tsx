import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"

import Title from "../../../components/Title"
import { useSnackBar, useLoading } from "context/GlobalContext"
import { getRoles, createAdmin } from "../api"
import { AdminRole } from "../../../../../types/admin.types"
import AdminForm from "../components/Form1"
import { useAdminForm } from "@context/AdminFormContext"

export default function CreateAdmin({ loadAdmin }) {
  const history = useHistory()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const { state, dispatch } = useAdminForm()

  const [roles, setRoles] = useState<AdminRole[]>([])

  const loadRoles = async () => {
    try {
      const roles = await getRoles()
      setRoles(roles)
    } catch (error) {
      showSnackBar(
        "Error obteniendo lista de roles, por favor inténtelo de nuevo."
      )
      console.error("Error obteniendo lista de roles:", error)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadRoles()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !state.username ||
      !state.area ||
      !state.firstname ||
      !state.lastname ||
      !state.phone ||
      !state.email ||
      !state.password
    ) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)

      const data = state
      data.email = data.email.toLowerCase()

      const admin = await createAdmin(data)
      if (!admin) {
        console.error("La respuesta de createAdmin es undefined")
      } else if (admin.success === false) {
        setLoading(false)
        showSnackBar(admin.message)
      } else if (admin.success === true) {
        showSnackBar(`Registro de Admin ${admin.newAdmin.username} exitoso.`)
        history.push({ pathname: "/admin/admins/read" })
        loadAdmin()
      }
    }
  }

  return (
    <React.Fragment>
        <Title title={'Crear Administrador'}/>
        <AdminForm handleSubmit={handleSubmit} roles={roles} />
    </React.Fragment>
  )
}
