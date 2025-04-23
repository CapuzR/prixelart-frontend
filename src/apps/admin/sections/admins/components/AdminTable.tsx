import { useNavigate } from "react-router-dom"
import { useState } from "react"

import Table1 from "@components/Table/index"
import { Admin } from "../../../../../types/admin.types"
import { Permissions } from "../../../../../types/permissions.types"

import { useSnackBar, useLoading } from "context/GlobalContext"
import { deleteAdmin } from "../api"

import { useAdminForm } from "@context/AdminFormContext"

interface AdminTableProps {
  admins: Admin[]
  permissions: Permissions
  loadAdmin: () => Promise<void>
  handleCallback: (admin: Admin) => void
}

export default function AdminTable({
  admins,
  loadAdmin,
  handleCallback
}: AdminTableProps) {
  const navigate = useNavigate()
  const { setLoading } = useLoading()
  const { showSnackBar } = useSnackBar()
  const { state, dispatch } = useAdminForm()

  const [pageNumber, setPageNumber] = useState(1)
  const [itemsPerPage, setItemPerPage] = useState(20)
  const [totalElements, setTotalElements] = useState(admins?.length)

  const headers = [
    { title: "Nombre", type: "string" },
    { title: "Apellido", type: "string" },
    { title: "Área", type: "string" },
    { title: "Correo", type: "string" },
    { title: "Usuario", type: "string" },
    { title: "Teléfono", type: "string" },
    "",
  ]

  const properties = [
    "firstname",
    "lastname",
    "area",
    "email",
    "username",
    "phone",
  ]

  const handleAdmin = (admin: Admin) => {
    navigate("/admin/user/update")

    dispatch({
      type: "SET_ADMIN",
      admin: admin,
    })
    handleCallback(admin)
  }

  const deleteMethod = async (row: Admin) => {
    setLoading(true)
    try {
      const del = await deleteAdmin(row.username)
      if (del && del.status === 200) {
        showSnackBar(`Administrador ${del.data.username} eliminado con éxito`)
        loadAdmin()
      }
    } catch (error) {
      showSnackBar(
        "Error eliminando administrador, refresque la ventana e inténtelo de nuevo."
      )
      console.error("Error obteniendo  eliminando administrador:", error)
    }
  }

  return (
    <Table1
      headers={headers}
      elements={admins}
      properties={properties}
      updateFunction={handleAdmin}
      deleteFunction={deleteMethod}
      setPageNumber={setPageNumber}
      pageNumber={pageNumber}
      itemsPerPage={itemsPerPage}
      maxLength={totalElements}
    />
  )
}
