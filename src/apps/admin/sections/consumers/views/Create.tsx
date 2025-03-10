import React, { useEffect, useState } from "react"

import Title from "@apps/admin/components/Title"
import Grid2 from "@mui/material/Grid2"
import { useHistory } from "react-router-dom"
import IconButton from "@mui/material/IconButton"
import ViewListIcon from "@mui/icons-material/ViewList"

import { getAllPrixers } from "../../prixers/api"
import { useSnackBar, useLoading } from "@context/GlobalContext"

import { Prixer } from "../../../../../types/prixer.types"

import { createConsumer } from "../api"
import ConsumerForm from "../components/Form"
import { useConsumerForm } from "@context/ConsumerFormContext"

export default function Create() {
  const history = useHistory()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const { state, dispatch } = useConsumerForm()

  const [prixers, setPrixers] = useState<Prixer[]>([])

  const admin = `${JSON.parse(localStorage.getItem("adminToken")).firstname} ${JSON.parse(localStorage.getItem("adminToken")).lastname}`

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!state.firstname && !state.lastname && !state.consumerType) {
      showSnackBar("Por favor completa todos los campos requeridos.")
      e.preventDefault()
    } else {
      setLoading(true)

      let data = state
      data.contactedBy = admin
      delete data._id

      const response = await createConsumer(data)
      if (response.data.success === false) {
        showSnackBar(response.data.message)
      } else {
        showSnackBar("Registro de consumidor exitoso.")
        resetState()
        history.push({ pathname: "/admin/consumer/read" })
      }
    }
  }

    const resetState = () => {
      dispatch({
        type: "RESET_FORM"
      })
    }

  const readPrixers = async () => {
    try {
      setLoading(true)
      const response = await getAllPrixers()
      setPrixers(response)
    } catch (error) {
      console.log(error)
    }
  }

  const handleConsumerAction = (action: string) => {
    history.push({ pathname: action })
  }

  useEffect(() => {
    readPrixers()
  }, [])
  
  return (
    <React.Fragment>
      <Grid2
        sx={{
          display: "flex",
          padding: 2,
          justifyContent: "space-between",
        }}
      >
        <Title title={"Crear Cliente"} />
        <IconButton
          onClick={() => {
            handleConsumerAction("read")
          }}
          style={{ right: 10 }}
        >
          <ViewListIcon />
        </IconButton>
      </Grid2>
      <ConsumerForm handleSubmit={handleSubmit} prixers={prixers} />
    </React.Fragment>
  )
}
