import React, { useEffect, useState } from "react"

import Title from "../Title"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import FormControl from "@mui/material/FormControl"
import Checkbox from "@mui/material/Checkbox"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import InputLabel from "@mui/material/InputLabel"
import { useHistory } from "react-router-dom"
import IconButton from "@mui/material/IconButton"
import ViewListIcon from "@mui/icons-material/ViewList"
import { nanoid } from "nanoid"

import { getAllPrixers } from "../prixers/api"
import { useSnackBar, useLoading } from "@context/GlobalContext"

import { Prixer } from "../../../../types/prixer.types"
import { createConsumer } from "./api"
import ConsumerForm from "./form"

export default function CreateConsumer() {
  const history = useHistory()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [active, setActive] = useState(true)
  const [consumerType, setConsumerType] = useState("Particular")
  const [consumerFirstname, setConsumerFirstname] = useState("")
  const [consumerLastname, setConsumerLastname] = useState("")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [billingAddress, setBillingAddress] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [instagram, setInstagram] = useState("")
  const [birthdate, setBirthdate] = useState<string>("")
  const [nationalIdType, setNationalIdType] = useState("V")
  const [nationalId, setNationalId] = useState("")
  const [gender, setGender] = useState("")
  const [prixers, setPrixers] = useState<Prixer[]>([])
  const [selectedPrixer, setSelectedPrixer] = useState<Prixer | undefined>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!consumerFirstname && !consumerLastname && !consumerType) {
      showSnackBar("Por favor completa todos los campos requeridos.")
      e.preventDefault()
    } else {
      setLoading(true)

      const data = {
        _id: nanoid(8).toString(),
        active: active,
        consumerType: consumerType,
        firstname: consumerFirstname,
        lastname: consumerLastname,
        username: username,
        phone: phone,
        email: email,
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        instagram: instagram,
        birthdate: new Date(birthdate),
        nationalIdType: nationalIdType,
        nationalId: nationalId,
        gender: gender,
        contactedBy: JSON.parse(localStorage.getItem("adminToken")),
      }

      const response = await createConsumer(data)
      if (response.data.success === false) {
        showSnackBar(response.data.message)
      } else {
        showSnackBar("Registro de consumidor exitoso.")
        setActive(false)
        setConsumerType("Particular")
        setConsumerFirstname("")
        setConsumerLastname("")
        setUsername("")
        setPhone("")
        setEmail("")
        setShippingAddress("")
        setInstagram("")
        setBirthdate("")
        setNationalIdType("")
        setNationalId("V")
        setGender("")
        history.push({ pathname: "/admin/consumer/read" })
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

  const handleConsumerAction = (action: string) => {
    history.push({ pathname: action })
  }

  useEffect(() => {
    readPrixers()
  }, [])

  useEffect(() => {
    setActive(true)
    setConsumerFirstname(selectedPrixer?.firstName)
    setConsumerLastname(selectedPrixer?.lastName)
    setPhone(selectedPrixer?.phone)
    setEmail(selectedPrixer?.email)
    setInstagram(selectedPrixer?.instagram)
  }, [selectedPrixer])

  return (
    <React.Fragment>
      <Grid2
        sx={{
          display: "flex",
          padding: 2,
          justifyContent: "space-between",
        }}
      >
        <Title>Crear Cliente</Title>
        <IconButton
          onClick={() => {
            handleConsumerAction("read")
          }}
          style={{ right: 10 }}
        >
          <ViewListIcon />
        </IconButton>
      </Grid2>
      <ConsumerForm handleSubmit={handleSubmit} prixers={prixers}/>
    </React.Fragment>
  )
}
