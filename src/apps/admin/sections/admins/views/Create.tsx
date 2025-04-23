import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Title from "../../../components/Title"
import { useSnackBar, useLoading } from "context/GlobalContext"
import { getRoles, createAdmin } from "../api"
import { AdminRole } from "../../../../../types/admin.types"
import AdminForm from "../components/Form1"
import { useAdminForm } from "@context/AdminFormContext"

interface AdminProps {
  loadAdmin: () => Promise<void>
}

export default function CreateAdmin({ loadAdmin }: AdminProps) {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const { state, dispatch } = useAdminForm()
  const { admin } = state
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
      !admin.username ||
      !admin.area ||
      !admin.firstname ||
      !admin.lastname ||
      !admin.phone ||
      !admin.email ||
      !admin.password
    ) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)

      const data = admin
      data.email = data.email.toLowerCase()

      const response = await createAdmin(data)
      if (!response) {
        console.error("La respuesta de createAdmin es undefined")
      } else if (response.success === false) {
        setLoading(false)
        showSnackBar(response.message)
      } else if (response.success === true) {
        showSnackBar(`Registro de Admin ${response.newAdmin.username} exitoso.`)
        navigate({ pathname: "/admin/admins/read" })
        loadAdmin()
      }
    }
  }

  return (
    <React.Fragment>
      <Title title={"Crear Administrador"} />
      <AdminForm handleSubmit={handleSubmit} roles={roles} />
    </React.Fragment>
  )
}
