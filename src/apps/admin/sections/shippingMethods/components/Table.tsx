import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import IconButton from "@mui/material/IconButton"

import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"

import Title from "../../../components/Title"
import Table1 from "@components/Table/index"

import { ShippingMethod } from "../../../../../types/shippingMethod.types"
import { useSnackBar, useLoading, getPermissions } from "context/GlobalContext"
import { getMethods, deleteMethod } from "../api"

interface TableProps {
  setName: (x: string) => void
  setPrice: (x: string) => void
  setActive: (x: boolean) => void
  setShippingMethod: (x: ShippingMethod) => void
}

export default function ShippingTable({
  setShippingMethod,
  setName,
  setPrice,
  setActive,
}: TableProps) {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()

  const [rows, setRows] = useState<ShippingMethod[]>()
  const totalElements = rows?.length
  const itemsPerPage = 20
  const [pageNumber, setPageNumber] = useState(1)
  const headers = ["Activo", "Nombre", "Costo", ""]
  const properties = ["active", "name", "price"]

  const readMethods = async () => {
    setLoading(true)
    try {
      const methods = await getMethods()
      setRows(methods)
    } catch (error) {
      showSnackBar(
        "Error obteniendo lista de administradores, por favor inténtelo de nuevo."
      )
      console.error("Error obteniendo listado de administradores:", error)
    }
  }

  useEffect(() => {
    readMethods()
  }, [])

  const handleActive = (shippingMethod: ShippingMethod) => {
    setShippingMethod(shippingMethod)
    setName(shippingMethod.name)
    setPrice(Number(shippingMethod.price))
    setActive(shippingMethod.active)
    navigate("/admin/shipping-method/update/" + shippingMethod._id)
  }

  const deleteShippingMethod = async (shippingMethod: ShippingMethod) => {
    setLoading(true)
    const response = await deleteMethod(shippingMethod._id)
    showSnackBar(response.shippingMethodForDelete)
    readMethods()
  }

  const handleAction = (action: string) => {
    navigate({ pathname: "/admin/shipping-method/" + action })
  }

  return (
    <>
      <div
        style={{ display: "flex", justifyContent: "space-between", margin: 20 }}
      >
        <Title title={"Métodos de entrega"} />
        <div style={{ display: "flex", gap: 20 }}>
          <IconButton
            color="default"
            aria-label="edit"
            style={{ marginRight: 10 }}
            onClick={() => {
              handleAction("read")
            }}
          >
            <ViewListIcon />
          </IconButton>
          {permissions?.createShippingMethod && (
            <IconButton
              color="primary"
              aria-label="add"
              onClick={() => {
                handleAction("create")
              }}
            >
              <AddIcon />
            </IconButton>
          )}
        </div>
      </div>
      <Table1
        headers={headers}
        elements={rows}
        properties={properties}
        updateFunction={handleActive}
        deleteFunction={deleteShippingMethod}
        setPageNumber={setPageNumber}
        pageNumber={pageNumber}
        itemsPerPage={itemsPerPage}
        maxLength={totalElements}
      />
    </>
  )
}
