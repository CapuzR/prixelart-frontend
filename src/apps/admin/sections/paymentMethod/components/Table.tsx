import React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import IconButton from "@mui/material/IconButton"
import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"

import Title from "../../../components/Title"
import Table1 from "@components/Table"

import { PaymentMethod } from "../../../../../types/paymentMethod.types"
import { useSnackBar, useLoading, getPermissions } from "context/GlobalContext"
import { getMethods, deleteMethod } from "../api"
import { title } from "process"

interface TableProps {
  setPaymentMethod: (element: PaymentMethod) => void
}

export default function PaymentTable({ setPaymentMethod }: TableProps) {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()

  const [totalElements, setTotalElements] = useState(rows?.length)
  const [itemsPerPage, setItemPerPage] = useState(20)
  const [pageNumber, setPageNumber] = useState(1)

  const headers = [
    { title: "Activo", type: "string" },
    { title: "Nombre", type: "string" },
    { title: "Datos de pago", type: "string" },
    { title: "Instrucciones", type: "string" },
    "",
  ]
  const properties = ["active", "name", "paymentData", "instructions"]

  const readMethods = async () => {
    setLoading(true)
    try {
      const methods = await getMethods()
      setRows(methods)
    } catch (error) {
      showSnackBar(
        "Error obteniendo lista de métodos de pago, por favor recarga la ventana."
      )
      console.error("Error obteniendo listado de métodos de pago:", error)
    }
  }

  useEffect(() => {
    readMethods()
  }, [])

  const handleActive = (paymentMethod: PaymentMethod) => {
    setPaymentMethod(paymentMethod)
    navigate("/admin/payment-method/update/" + paymentMethod._id)
  }

  const handleAction = (action: string) => {
    navigate({ pathname: "/admin/payment-method/" + action })
  }

  const deletePaymentMethod = async (paymentMethod: PaymentMethod) => {
    setLoading(true)
    const response = await deleteMethod(paymentMethod._id)
    showSnackBar(`Método de pago ${paymentMethod.name} eliminado exitosamente.`)
    readMethods()
  }

  return (
    <React.Fragment>
      <div
        style={{ display: "flex", justifyContent: "space-between", margin: 20 }}
      >
        <Title title={"Métodos de pago"} />
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
          {permissions?.createPaymentMethod && (
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
        deleteFunction={deletePaymentMethod}
        setPageNumber={setPageNumber}
        pageNumber={pageNumber}
        itemsPerPage={itemsPerPage}
        maxLength={totalElements}
      />
    </React.Fragment>
  )
}
