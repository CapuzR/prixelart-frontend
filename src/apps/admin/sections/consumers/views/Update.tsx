import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Title from "@apps/admin/components/Title"
import Grid2 from "@mui/material/Grid2"
import IconButton from "@mui/material/IconButton"
import ViewListIcon from "@mui/icons-material/ViewList"

import { getAllPrixers } from "../../prixers/api"
import { updateConsumer } from "../api"
import { useSnackBar, useLoading } from "@context/GlobalContext"

import { Prixer } from "../../../../../types/prixer.types"
import { useConsumerForm } from "@context/ConsumerFormContext"
import ConsumerForm from "../components/Form"

export default function Update() {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const { state, dispatch } = useConsumerForm()
  const [prixers, setPrixers] = useState<Prixer[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!state.firstname && !state.lastname && !state.consumerType) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)

      const response = await updateConsumer(state)

      if (response && response.data.success === false) {
        showSnackBar(response.data.message)
      } else {
        showSnackBar("Actualización de consumidor exitosa.")
        navigate("/admin/consumer/read")
        resetState()
      }
    }
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

  const resetState = () => {
    dispatch({
      type: "RESET_FORM",
    })
  }

  useEffect(() => {
    readPrixers()
  }, [])

  const handleConsumerAction = (action: string) => {
    navigate({ pathname: action })
  }

  return (
    <React.Fragment>
      <Grid2
        sx={{
          display: "flex",
          padding: 2,
          justifyContent: "space-between",
        }}
      >
        <Title title={"Actualizar Cliente"} />
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
